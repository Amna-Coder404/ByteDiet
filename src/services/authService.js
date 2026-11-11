import { supabase } from '../lib/supabase';

const DUPLICATE_MSG = 'An account with this email already exists. Please log in.';

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
  if (error) {
    if (/already registered|already exists/i.test(error.message)) return { ok: false, error: DUPLICATE_MSG };
    return { ok: false, error: error.message };
  }
  // With email confirmation on, an existing email returns a user with no identities.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, error: DUPLICATE_MSG };
  }
  return { ok: true, needsVerification: !data.session };
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) {
    if (/invalid login credentials/i.test(error.message)) return { ok: false, error: 'Incorrect email or password.' };
    if (/not confirmed/i.test(error.message)) return { ok: false, error: 'Please verify your email first, then log in.' };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session ?? null));
  return data.subscription;
}
