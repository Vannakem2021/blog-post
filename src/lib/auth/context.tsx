"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AuthState, AuthUser } from "@/lib/types";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await updateUserState(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await updateUserState(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserState = async (authUser: User) => {
    console.log("👤 Updating user state for:", authUser.email);

    // Temporary fix: hardcode admin for your email
    const isYourEmail = authUser.email === "vannakem2021@gmail.com";

    if (isYourEmail) {
      console.log("👤 Using hardcoded admin role for your email");
      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        role: "admin",
      };
      setUser(userData);
      setIsAdmin(true);
      return;
    }

    // Get user profile to check role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, fullName, avatarUrl")
      .eq("id", authUser.id)
      .single();

    console.log("👤 Profile query result:", { profile, error });

    const userData: AuthUser = {
      id: authUser.id,
      email: authUser.email!,
      role: profile?.role || "user",
    };

    console.log("👤 Setting user data:", userData);
    console.log("👤 Is admin?", profile?.role === "admin");

    setUser(userData);
    setIsAdmin(profile?.role === "admin");
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting to sign in with:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("🔐 Sign in response:", { data, error });

      if (error) {
        console.error("🔐 Sign in error:", error);
        return { error: error.message };
      }

      console.log("🔐 Sign in successful!");
      return {};
    } catch (error) {
      console.error("🔐 Unexpected error:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
