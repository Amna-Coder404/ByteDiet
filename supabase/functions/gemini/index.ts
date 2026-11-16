// @ts-nocheck

// --------------------------------------------------
// Configuration
// --------------------------------------------------

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Tried in order. If one model fails, the next one is used.
const MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
];

// Retries PER MODEL
const MAX_RETRIES = 1;
const REQUEST_TIMEOUT = 20000;
const RETRY_DELAY = 500;

const MAX_MESSAGES = 12;
const MAX_IMAGE_BASE64 = 8_000_000;
const MAX_REQUEST_SIZE = 12_000_000;

const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

// --------------------------------------------------
// Response helper
// --------------------------------------------------

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      'Content-Type': 'application/json',
    },
  });

// --------------------------------------------------
// Meal analysis instructions
// --------------------------------------------------

const MEAL_INSTRUCTION = `
You are a professional nutrition estimation assistant.

Analyze the food in the image and estimate its nutritional values.

Return ONLY valid JSON using this exact structure:

{
  "is_food": true,
  "meal_name": "Meal name",
  "items": [
    {
      "name": "Food item",
      "calories": 200,
      "protein_g": 10,
      "carbs_g": 20,
      "fat_g": 8
    }
  ],
  "total": {
    "calories": 200,
    "protein_g": 10,
    "carbs_g": 20,
    "fat_g": 8
  },
  "note": "Short estimation note"
}

Rules:
- Estimate realistic nutritional values.
- All nutritional values must be numbers.
- If the image does not contain food, set is_food to false.
- Do not invent food items that are not visible.
- Write meal_name, item names and note in the same language the user wrote in (default English). Keep the JSON keys in English.
- Return JSON only.
- Do not include Markdown or code fences.
`;

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getText(data: any): string {
  return (data?.candidates?.[0]?.content?.parts ?? [])
    .map((part: any) => part.text ?? '')
    .join('')
    .trim();
}

function parseMeal(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const meal = JSON.parse(cleaned);

  if (!meal || typeof meal !== 'object' || Array.isArray(meal)) {
    throw new Error('Invalid meal response');
  }

  const number = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  return {
    is_food: Boolean(meal.is_food),

    meal_name: String(meal.meal_name ?? 'Unknown meal'),

    items: Array.isArray(meal.items)
      ? meal.items.map((item: any) => ({
        name: String(item.name ?? 'Food item'),
        calories: number(item.calories),
        protein_g: number(item.protein_g),
        carbs_g: number(item.carbs_g),
        fat_g: number(item.fat_g),
      }))
      : [],

    total: {
      calories: number(meal.total?.calories),
      protein_g: number(meal.total?.protein_g),
      carbs_g: number(meal.total?.carbs_g),
      fat_g: number(meal.total?.fat_g),
    },

    note: String(meal.note ?? ''),
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --------------------------------------------------
// Gemini API request with retry (single model)
// --------------------------------------------------

async function requestGemini(key: string, requestBody: any, model: string) {
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        },
      );

      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw Object.assign(
          new Error('Invalid response received from Gemini API'),
          { status: 502, retryable: true },
        );
      }

      if (response.ok) {
        console.log('[ByteDiet AI] Gemini success:', { model, attempt });
        return data;
      }

      const status = response.status;
      const message = data?.error?.message ?? 'Gemini API request failed';

      console.error('[ByteDiet AI] Gemini API error:', {
        model,
        status,
        attempt,
        message,
      });

      lastError = {
        status,
        message,
        retryable: RETRYABLE_STATUSES.includes(status),
      };

      if (!lastError.retryable) {
        throw Object.assign(new Error(message), {
          status,
          retryable: false,
        });
      }
    } catch (error: any) {
      if (error?.retryable === false) {
        throw error;
      }

      if (error?.name === 'AbortError') {
        lastError = {
          status: 504,
          message: 'Gemini request timed out',
          retryable: true,
        };
      } else {
        lastError = {
          status: error?.status ?? 502,
          message: error?.message ?? 'Gemini network error',
          retryable: true,
        };
      }

      console.error('[ByteDiet AI] Request attempt failed:', {
        model,
        attempt,
        message: lastError.message,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < MAX_RETRIES) {
      await wait(RETRY_DELAY * attempt);
    }
  }

  throw Object.assign(
    new Error(lastError?.message ?? 'Gemini API unavailable'),
    {
      status: lastError?.status ?? 503,
      retryable: true,
    },
  );
}

// --------------------------------------------------
// Model fallback wrapper
// --------------------------------------------------

async function requestWithFallback(key: string, requestBody: any) {
  const failures: any[] = [];

  for (const model of MODELS) {
    try {
      return await requestGemini(key, requestBody, model);
    } catch (error: any) {
      failures.push({
        model,
        status: error?.status,
        message: error?.message,
      });

      console.error('[ByteDiet AI] Model failed:', {
        model,
        status: error?.status,
        message: error?.message,
      });

      // Bad key / no permission: other models will fail the same way.
      if ([401, 403].includes(error?.status)) break;
    }
  }

  throw Object.assign(
    new Error(failures[0]?.message ?? 'AI unavailable'),
    {
      status: failures[0]?.status ?? 503,
      retryable: failures.some((f) => RETRYABLE_STATUSES.includes(f.status)),
      failures,
    },
  );
}

// --------------------------------------------------
// Main Supabase Edge Function
// --------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    // Set with: supabase secrets set GEMINI_API_KEY=...
    const key = Deno.env.get('GEMINI_API_KEY');

    if (!key) {
      console.error('[ByteDiet AI] GEMINI_API_KEY is missing');
      return json({ error: 'GEMINI_API_KEY secret is not set' }, 500);
    }

    // Request size validation
    const contentLength = Number(req.headers.get('content-length') ?? 0);

    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
      return json({ error: 'Request is too large' }, 413);
    }

    // Parse request body
    let body: any;

    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }

    if (
      new TextEncoder().encode(JSON.stringify(body)).length > MAX_REQUEST_SIZE
    ) {
      return json({ error: 'Request is too large' }, 413);
    }

    const { mode, messages, system } = body ?? {};

    // Validate mode
    if (!['chat', 'meal'].includes(mode)) {
      return json({ error: 'Invalid AI mode' }, 400);
    }

    // Validate messages
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > MAX_MESSAGES
    ) {
      return json({ error: 'Invalid messages' }, 400);
    }

    // Validate system instructions
    if (typeof system !== 'string' || system.length > 12000) {
      return json({ error: 'Invalid system instructions' }, 400);
    }

    // Convert messages to Gemini format
    const contents: any[] = [];

    for (const message of messages) {
      if (!['user', 'model'].includes(message?.role)) {
        return json({ error: 'Invalid message role' }, 400);
      }

      const parts: any[] = [];

      if (message.text !== undefined) {
        if (typeof message.text !== 'string' || message.text.length > 4000) {
          return json({ error: 'Invalid message text' }, 400);
        }

        if (message.text.trim()) {
          parts.push({ text: message.text });
        }
      }

      if (message.image) {
        if (mode !== 'meal' || message.role !== 'user') {
          return json(
            { error: 'Images are only supported for meal analysis' },
            400,
          );
        }

        const { mimeType, data } = message.image;

        if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType) ||
          typeof data !== 'string' ||
          !data ||
          data.length > MAX_IMAGE_BASE64 ||
          !/^[A-Za-z0-9+/]+={0,2}$/.test(data) ||
          data.length % 4 !== 0
        ) {
          return json({ error: 'Invalid image data' }, 400);
        }

        parts.push({ inlineData: { mimeType, data } });
      }

      if (parts.length === 0) {
        return json({ error: 'Empty message' }, 400);
      }

      contents.push({ role: message.role, parts });
    }

    // Meal mode validation
    if (mode === 'meal') {
      if (
        messages.length !== 1 ||
        messages[0].role !== 'user' ||
        !messages[0].image
      ) {
        return json(
          { error: 'Meal analysis requires one user image message' },
          400,
        );
      }

      contents[0].parts.unshift({ text: MEAL_INSTRUCTION });
    }

    // Build Gemini request
    const requestBody: any = {
      contents,
      generationConfig:
        mode === 'meal'
          ? {
            responseMimeType: 'application/json',
            maxOutputTokens: 800,
          }
          : {
            maxOutputTokens: 500,
          },
    };

    if (system.trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: system }],
      };
    }


    // Call Gemini API (with model fallback)
    let result: any;

    try {
      result = await requestWithFallback(key, requestBody);
    } catch (error: any) {
      console.error('[ByteDiet AI] All models failed:', {
        status: error.status,
        retryable: error.retryable,
        message: error.message,
        failures: error.failures,
      });

      return json(
        {
          error: error.retryable
            ? 'AI is temporarily unavailable. Please try again shortly.'
            : error.message,
          retryable: Boolean(error.retryable),
          debug: error.failures,
        },
        error.status ?? 502,
      );
    }

    // Extract Gemini response
    const text = getText(result);

    if (!text) {
      const finishReason = result?.candidates?.[0]?.finishReason;

      console.error('[ByteDiet AI] Empty Gemini response:', {
        finishReason,
        promptFeedback: result?.promptFeedback,
      });

      return json(
        { error: 'Gemini returned an empty response', retryable: false },
        502,
      );
    }

    // Chat response
    if (mode === 'chat') {
      return json({ text });
    }

    // Meal analysis response
    try {
      const meal = parseMeal(text);
      return json({ meal });
    } catch (error: any) {
      console.error(
        '[ByteDiet AI] Meal JSON parsing error:',
        error?.message,
        text,
      );

      return json(
        {
          error: 'Could not parse meal analysis. Please try again.',
          retryable: false,
        },
        502,
      );
    }
  } catch (error: any) {
    console.error('[ByteDiet AI] Function error:', error);

    return json({ error: 'Internal server error', retryable: false }, 500);
  }
});