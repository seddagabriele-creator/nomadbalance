import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { debugLog } from './debugLog';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Safety net: if Supabase is unreachable (e.g. the project is paused
    // and DNS fails), supabase-js retries the token refresh with backoff
    // and getSession() can stay pending indefinitely — leaving the app
    // stuck on the loading spinner forever. Force out of the loading state
    // after 6s so the app renders (login/landing) instead of hanging.
    const loadingSafety = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 6000);

    // Listen for auth state changes FIRST (before getSession)
    // This prevents a race condition where getSession returns null
    // while the SDK is still processing auth tokens from the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const hasUser = !!session?.user;
        const expiresAt = session?.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : "n/a";
        debugLog("auth", `onAuthStateChange: ${event}`, {
          hasUser,
          expiresAt,
          userId: session?.user?.id?.slice(0, 8),
        });

        // Ignore TOKEN_REFRESHED events that still have a valid session —
        // they would otherwise cause a new `user` object reference to
        // propagate through the context, triggering re-renders (and in
        // some cases re-mounting downstream providers that hold the
        // active focus session state).
        if (event === "TOKEN_REFRESHED" && session?.user) {
          clearTimeout(loadingSafety);
          setIsLoadingAuth(false);
          return;
        }
        setUser(session?.user ?? null);
        setIsAuthenticated(hasUser);
        clearTimeout(loadingSafety);
        setIsLoadingAuth(false);
        if (event === "PASSWORD_RECOVERY") {
          setIsRecovery(true);
        }
      }
    );

    // Then check current session as fallback
    supabase.auth.getSession().then(({ data: { session } }) => {
      debugLog("auth", "getSession (initial)", {
        hasUser: !!session?.user,
        expiresAt: session?.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : "n/a",
      });
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      clearTimeout(loadingSafety);
      setIsLoadingAuth(false);
    }).catch((err) => {
      // Backend unreachable — don't hang, let the app render the login page
      debugLog("auth", "getSession failed", { error: err?.message || String(err) });
      clearTimeout(loadingSafety);
      setIsLoadingAuth(false);
    });

    // Background Chrome tabs throttle JS timers, which can starve
    // supabase-js's autoRefreshToken loop. When the user comes back after
    // a while, the access token may already be expired and the next API
    // call would sign them out. Proactively refresh on tab visibility so
    // the session stays alive across long backgrounding.
    const handleVisibilityChange = async () => {
      if (document.hidden) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          debugLog("auth", "visibility: tab visible, no session found");
          return;
        }
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        const ttl = expiresAt ? Math.round((expiresAt - Date.now()) / 1000) : null;
        // Refresh if the token is expired or within 60s of expiring.
        if (expiresAt && expiresAt - Date.now() < 60_000) {
          debugLog("auth", "visibility: refreshing session", { ttl });
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            debugLog("auth", "visibility: refresh FAILED", { error: error.message });
          } else {
            debugLog("auth", "visibility: refresh OK");
          }
        }
      } catch (err) {
        debugLog("auth", "visibility: error", { error: err?.message || String(err) });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(loadingSafety);
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      login,
      signup,
      logout,
      resetPassword,
      updatePassword,
      isRecovery,
      setIsRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
