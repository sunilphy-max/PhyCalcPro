"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from "@/lib/supabaseBrowser";
import { clearAuthenticatedLocalData } from "@/lib/persistence/clientStorage";

type AuthResult = { error?: string; needsEmailConfirmation?: boolean };

type AuthContextValue = {
  configured: boolean;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<AuthResult>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<AuthResult>;
  resetPasswordForEmail: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  updateProfile: (fields: { displayName?: string }) => Promise<AuthResult>;
  resendVerificationEmail: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function originRedirect(path: string) {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${path}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseBrowserConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) {
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Sign-in is not configured." };

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: originRedirect("/auth/callback") },
    });

    return error ? { error: error.message } : {};
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Sign-in is not configured." };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return { error: "Sign-up is not configured." };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: originRedirect("/auth/callback"),
          data: displayName ? { display_name: displayName, full_name: displayName } : undefined,
        },
      });

      if (error) return { error: error.message };

      // When email confirmation is required, session is null until verified.
      if (!data.session) {
        return { needsEmailConfirmation: true };
      }
      return {};
    },
    []
  );

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Password reset is not configured." };

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: originRedirect("/auth/callback?next=/auth/reset-password"),
    });
    return error ? { error: error.message } : {};
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Not configured." };

    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: error.message } : {};
  }, []);

  const updateProfile = useCallback(async (fields: { displayName?: string }) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Not configured." };

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: fields.displayName,
        full_name: fields.displayName,
      },
    });
    return error ? { error: error.message } : {};
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Not configured." };

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: originRedirect("/auth/callback") },
    });
    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    const previousId = user?.id;
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Clear local state anyway.
      }
    }
    if (previousId) clearAuthenticatedLocalData(previousId);
    setUser(null);
  }, [user?.id]);

  const value = useMemo(
    () => ({
      configured,
      user,
      loading,
      signInWithEmail,
      signInWithPassword,
      signUpWithPassword,
      resetPasswordForEmail,
      updatePassword,
      updateProfile,
      resendVerificationEmail,
      signOut,
    }),
    [
      configured,
      user,
      loading,
      signInWithEmail,
      signInWithPassword,
      signUpWithPassword,
      resetPasswordForEmail,
      updatePassword,
      updateProfile,
      resendVerificationEmail,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
