import { supabase } from '../lib/supabase';
import { getDateKey, getDateLabel, getTime } from '../utils/format';
// All AI requests go through the Supabase Edge Function.
// Gemini API keys must never be exposed in the mobile app.

const FUNCTION_NAME = 'gemini';

const DEFAULT_ERROR =
  'AI is temporarily unavailable. Please try again shortly.';

// --------------------------------------------------
// Error helpers
// --------------------------------------------------

function getFriendlyError(message, status) {
  if (status === 429) {
    return 'Too many AI requests. Please wait a moment and try again.';
  }

  if (status === 503 || status === 502 || status === 504) {
    return 'AI is temporarily busy. Please try again shortly.';
  }

  if (status === 401 || status === 403) {
    return 'AI service authentication failed. Please contact support.';
  }

  if (status === 413) {
    return 'Your request is too large. Please try a smaller image.';
  }

  if (
    message?.toLowerCase().includes('network') ||
    message?.toLowerCase().includes('fetch')
  ) {
    return 'Unable to connect to ByteDiet AI. Check your internet connection.';
  }

  return message || DEFAULT_ERROR;
}

function isRetryable(status) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

// --------------------------------------------------
// Single AI request
// --------------------------------------------------

async function callOnce(body) {
  console.log('[ByteDiet AI] Request:', {
    mode: body.mode,
    systemLength: body.system?.length,
    messagesCount: body.messages?.length,
    messages: body.messages?.map((message) => ({
      role: message.role,
      hasText: Boolean(message.text),
      textLength: message.text?.length,
      hasImage: Boolean(message.image),
      mimeType: message.image?.mimeType,
      imageLength: message.image?.data?.length,
    })),
  });

  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body,
    });

    // Supabase function errors
    if (error) {
      let message = error.message || DEFAULT_ERROR;
      const status = error.context?.status;

      try {
        const response = error.context;

        if (response && typeof response.json === 'function') {
          const details = await response.clone().json();

          console.error(
            '[ByteDiet AI] Server error:',
            status,
            JSON.stringify(details, null, 2)
          );

          if (details?.error) {
            message = details.error;
          }
        }
      } catch (parseError) {
        console.error('[ByteDiet AI] Could not parse server error:', parseError);
      }

      return {
        ok: false,
        error: getFriendlyError(message, status),
        retryable: isRetryable(status),
        status: status || null,
      };
    }

    // Backend returned an error inside a successful response
    if (data?.error) {
      console.error('[ByteDiet AI] Response error:', data);

      return {
        ok: false,
        error: data.error,
        retryable: Boolean(data.retryable),
      };
    }

    if (!data) {
      return {
        ok: false,
        error: 'The AI server returned an empty response.',
        retryable: true,
      };
    }

    console.log('[ByteDiet AI] Success:', body.mode);

    return { ok: true, data };
  } catch (error) {
    console.error('[ByteDiet AI] Request failed:', error);

    return {
      ok: false,
      error: getFriendlyError(error?.message),
      retryable: true,
    };
  }
}

// --------------------------------------------------
// Request with automatic retry (handles short Google spikes)
// --------------------------------------------------

async function call(body, attempts = 3) {
  let result;

  for (let i = 0; i < attempts; i++) {
    result = await callOnce(body);

    if (result.ok || !result.retryable) return result;

    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (i + 1)));
    }
  }

  return result;
}

// --------------------------------------------------
// Chat with AI
// --------------------------------------------------

export async function chatWithAI(messages, system) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: 'Please enter a message before sending.' };
  }

  const result = await call({ mode: 'chat', messages, system });

  if (!result.ok) {
    return result;
  }

  if (!result.data?.text?.trim()) {
    return {
      ok: false,
      error: 'The AI returned an empty answer. Please try again.',
    };
  }

  return { ok: true, text: result.data.text.trim() };
}

// --------------------------------------------------
// Analyze meal (photo and/or text)
// --------------------------------------------------

export async function analyzeMeal(message, system) {
  if (
    !message ||
    message.role !== 'user' ||
    (!message.image?.data && !message.text?.trim())
  ) {
    return {
      ok: false,
      error: 'Please add a food photo or describe what you ate.',
    };
  }

  const result = await call({ mode: 'meal', messages: [message], system });

  if (!result.ok) {
    return result;
  }

  if (!result.data?.meal) {
    return {
      ok: false,
      error: 'Could not read that meal. Try a clearer photo or describe it again.',
    };
  }

  return { ok: true, meal: result.data.meal };
}

// Day count since the goal started. Day 1 = the start day.
function getGoalJourney(startedAt) {
  if (!startedAt) return null;

  const start = new Date(startedAt);
  if (Number.isNaN(start.getTime())) return null;

  const startKey = getDateKey(start);
  const todayKey = getDateKey(new Date());

  const daysAgo = Math.max(
    0,
    Math.round(
      (new Date(`${todayKey}T00:00:00`) - new Date(`${startKey}T00:00:00`)) /
      86400000
    )
  );

  return {
    daysAgo,
    dayNumber: daysAgo + 1,
    date: getDateLabel(startKey), // "Today", "Yesterday" or "Friday, 13 Nov 2026"
    time: getTime(start),         // "09:45 PM"
  };
}

// --------------------------------------------------
// Build AI system prompt
// --------------------------------------------------

export function buildSystemPrompt(
  profile = {},
  goals = {},
  plan = {},
  eatenCalories = 0
) {
  const allergies = goals.allergies?.length
    ? goals.allergies.join(', ')
    : 'none';

  const targetCalories = Number(plan.calories) || 0;
  const eaten = Number(eatenCalories) || 0;
  const left = targetCalories - eaten;
  const journey = getGoalJourney(goals.goal_started_at);

  const journeyLine = journey
    ? `Goal started: ${journey.date} at ${journey.time}. ` +
    `That was ${journey.daysAgo} days ago, so today is day ${journey.dayNumber} of the journey.\n`
    : '';
  return (
    'You are ByteDiet, a friendly nutrition coach inside a mobile app. ' +
    'You are not a doctor. For medical issues, advise the user to consult a qualified healthcare professional.\n' +

    `User: ${profile.name || 'User'}, ` +
    `${profile.age || 'unknown'} years old, ` +
    `${profile.gender || 'not specified'}, ` +
    `${profile.height_cm || 'unknown'} cm, ` +
    `${profile.current_weight_kg || 'unknown'} kg.\n` +

    `Goal: ${goals.fitness_goal || 'general health'}. ` +
    `Activity: ${goals.activity_level || 'not specified'}. ` +
    `Diet: ${goals.dietary_preference || 'not specified'}. ` +
    `Allergies: ${allergies}.\n` +

    `Daily target: ${targetCalories} kcal, ` +
    `${Number(plan.protein) || 0} g protein, ` +
    `${Number(plan.carbs) || 0} g carbs, ` +
    `${Number(plan.fat) || 0} g fat.\n` +

    `Eaten today so far: ${Math.round(eaten)} kcal. ` +
    `Remaining today: ${Math.round(left)} kcal.\n` +
    journeyLine +
    'Always reply in the same language and script the user writes in. ' +
    'If the user writes Roman Urdu (Urdu in English letters), reply in Roman Urdu. ' +
    'If the user writes Urdu script, reply in Urdu script. ' +
    'If the user writes English, reply in English. ' +
    'If they switch language, switch with them. ' +
    'Reply in plain text only. Avoid Markdown symbols such as * or #. ' +
    'Keep answers short, friendly, and practical. ' +
    'Never recommend foods containing the user allergens. ' +
    'Respect the user dietary preferences. ' +
    'Use some friendly emojis, like a good friend would. ' +
    'When analyzing a meal, always use the quantity the user mentions in their text ' +
    '(for example "2 rotis" or "1 bowl") over what you guess from the photo. ' +
    'If the user describes food in text only, estimate calories and macros from that text. ' +
    'If there is no food in the photo or text, set is_food to false. ' +
    'If the user asks when they started their goal or how many days have passed, ' +
    'use the exact start date, time and day count given above. Do not calculate dates yourself. '
  );
}

