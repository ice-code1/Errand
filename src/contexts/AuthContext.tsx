import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "../services/supabase";
import toast from 'react-hot-toast';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_runner: boolean;
  bio?: string | null;
}

interface ExtendedUser extends User {
  profile?: Profile | null;
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, isRunner?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>; // 👈 manual refresh
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile for the current user
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  };

  const loadUserWithProfile = async (session: Session | null) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setUser({ ...session.user, profile });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // ✅ Restore session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error getting session:", error);

      if (data?.session) {
        setSession(data.session);
        await loadUserWithProfile(data.session);
      }
      setLoading(false);
    };

    getSession();

    // ✅ Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await loadUserWithProfile(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, isRunner = false) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { fullName, isRunner },
        },
      });
      if (error) throw error;

      // Insert a profile row too
      if (data?.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          is_runner: isRunner,
        });
      }

      toast.success("Account created! Please check your email to confirm.");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setUser({ ...user, profile });
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
