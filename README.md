# ByteDiet

ByteDiet is a nutrition, diet planning, calorie tracking and fitness mobile app for Android and iOS. It includes an AI Coach that can estimate calories from a photo of your food and show how much you have eaten today.

## Features

- **Intro screen**: shown once per install
- **Authentication**: sign up, log in and log out with Supabase Auth and a persisted session
- **Onboarding**: 2-step setup that saves your profile and nutrition goals
- **Personalized dashboard**: your goals and daily progress at a glance
- **AI Coach**: chat-style assistant powered by Gemini. Send a food photo, get a calorie estimate and see your calories eaten today
- **Fitness and personal goals**: track and edit your goals
- **Offline support**: screens work offline, edits are queued and synced to Supabase when the internet returns
- **Dark mode**: toggle from the drawer

## Tech Stack

| Area | Technology |
| --- | --- |
| App | React Native, Expo, Expo Router (JavaScript/JSX) |
| Backend | Supabase (Auth, PostgreSQL, Row Level Security) |
| AI | Gemini API via a Supabase Edge Function |
| Local storage | AsyncStorage |
| Animations | React Native Reanimated |


## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone, or an Android/iOS emulator
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <your-repo-url>
cd bytediet
npm install
```

### 2. Add your Supabase keys

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database

In the Supabase SQL editor, create the `profiles` and `nutrition_goals` tables and enable Row Level Security so each user can only read and write their own rows.

### 4. Deploy the AI Coach function

The Gemini API key is **never stored in the app**. It lives in a Supabase Edge Function.

```bash
cd bytediet-backend
supabase secrets set GEMINI_API_KEY=your_gemini_key
supabase functions deploy <your-function-name>
```

### 5. Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` (Android) / `i` (iOS).
