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
    try {
      // Check if user is in admin emails environment variable
      const adminEmails =
        process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((email) =>
          email.trim()
        ) || [];
      const isAdminByEnv = adminEmails.includes(authUser.email || "");

      // Get user profile to check role from database
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, full_name, avatar_url")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);

        // If profile doesn't exist but user is in admin emails, create admin profile
        if (isAdminByEnv) {
          try {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: authUser.id,
                email: authUser.email!,
                role: "admin",
                status: "active",
                full_name: authUser.user_metadata?.full_name || "Admin User",
              });

            if (!insertError) {
              const userData: AuthUser = {
                id: authUser.id,
                email: authUser.email!,
                role: "admin",
              };
              setUser(userData);
              setIsAdmin(true);
              return;
            }
          } catch (insertError) {
            console.error("Error creating admin profile:", insertError);
          }
        }

        // If profile doesn't exist and not admin by env, user has no access
        setUser(null);
        setIsAdmin(false);
        return;
      }

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        role: profile?.role || "user",
      };

      setUser(userData);
      setIsAdmin(profile?.role === "admin" || isAdminByEnv);
    } catch (error) {
      console.error("Error updating user state:", error);
      setUser(null);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
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
