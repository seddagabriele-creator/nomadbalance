import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for auth state changes FIRST (before getSession)
    // This prevents a race condition where getSession returns null
    // while the SDK is still processing auth tokens from the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore TOKEN_REFRESHED events that still have a valid session —
        // they would otherwise cause a new `user` object reference to
        // propagate through the context, triggering re-renders (and in
        // some cases re-mounting downstream providers that hold the
        // active focus session state).
        if (event === "TOKEN_REFRESHED" && session?.user) {
          setIsLoadingAuth(false);
          return;
        }
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setIsLoadingAuth(false);
        if (event === "PASSWORD_RECOVERY") {
          setIsRecovery(true);
        }
      }
    );

    // Then check current session as fallback
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
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
        if (!session) return;
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        // Refresh if the token is expired or within 60s of expiring.
        if (expiresAt && expiresAt - Date.now() < 60_000) {
          await supabase.auth.refreshSession();
        }
      } catch {
        // Network errors are fine — the SDK will retry on the next call.
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
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
