import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getSession, onAuthChange } from '../services/authService';
import { getOnboardingStatus } from '../services/onboardingService';
import { hasSeenIntro, markIntroSeen } from '../services/storageService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const EMPTY = { profileDone: false, goalsDone: false, complete: false };

export function AuthProvider({ children }) {
  const [introLoaded, setIntroLoaded] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);
  const [authEntry, setAuthEntry] = useState('login');
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    hasSeenIntro().then((v) => {
      setIntroSeen(v);
      setIntroLoaded(true);
    });
  }, []);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setSessionLoaded(true);
    });
    const sub = onAuthChange((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setOnboarding(null);
      return;
    }
    let cancelled = false;
    setOnboarding(null);
    getOnboardingStatus(userId)
      .then((st) => !cancelled && setOnboarding(st))
      .catch(() => !cancelled && setOnboarding(EMPTY));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refreshOnboarding = useCallback(async () => {
    if (!userId) return EMPTY;
    const st = await getOnboardingStatus(userId);
    setOnboarding(st);
    return st;
  }, [userId]);

  // entry: 'signup' | 'login' -> which auth screen to open after the intro
  const completeIntro = useCallback(async (entry) => {
    await markIntroSeen();
    setAuthEntry(entry);
    setIntroSeen(true);
  }, []);

  const ready = introLoaded && sessionLoaded && (!session || onboarding !== null);

  return (
    <AuthContext.Provider
      value={{ ready, session, user: session?.user ?? null, introSeen, authEntry, onboarding, refreshOnboarding, completeIntro }}
    >
      {children}
    </AuthContext.Provider>
  );
}
