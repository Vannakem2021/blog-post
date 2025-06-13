import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

// Security constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export interface SecurityProfile {
  id: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "locked";
  failed_login_attempts: number;
  last_login_at?: string;
  last_login_ip?: string;
  mfa_enabled: boolean;
}

/**
 * Enhanced admin access validation with security checks
 */
export async function validateAdminAccess(): Promise<{
  user: User;
  profile: SecurityProfile;
}> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Get user profile with security information
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      role,
      status,
      failed_login_attempts,
      last_login_at,
      last_login_ip,
      mfa_enabled
    `
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // Check if user is in admin emails environment variable as fallback
    const adminEmails =
      process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((email) =>
        email.trim()
      ) || [];
    const isAdminByEnv = adminEmails.includes(user.email || "");

    if (isAdminByEnv) {
      // Create the missing profile for admin user
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        role: "admin",
        status: "active",
        failed_login_attempts: 0,
        mfa_enabled: false,
      });

      if (!insertError) {
        // Retry the query
        const { data: newProfile, error: retryError } = await supabase
          .from("profiles")
          .select(
            `
            id,
            email,
            role,
            status,
            failed_login_attempts,
            last_login_at,
            last_login_ip,
            mfa_enabled
          `
          )
          .eq("id", user.id)
          .single();

        if (!retryError && newProfile) {
          // Continue with the new profile
          return { user, profile: newProfile };
        }
      }
    }

    throw new Error("User profile not found");
  }

  // Security checks
  if (profile.status !== "active") {
    throw new Error(
      `Account is ${profile.status}. Please contact administrator.`
    );
  }

  if (profile.role !== "admin") {
    throw new Error("Admin access required");
  }

  // Check session timeout
  if (profile.last_login_at) {
    const lastLogin = new Date(profile.last_login_at);
    const now = new Date();
    if (now.getTime() - lastLogin.getTime() > SESSION_TIMEOUT) {
      throw new Error("Session expired. Please log in again.");
    }
  }

  return { user, profile };
}

/**
 * Log security event to audit table
 */
export async function logSecurityEvent(
  eventType: string,
  userId?: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.rpc("log_security_event", {
      event_type: eventType,
      user_id: userId,
      details: details,
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

/**
 * Handle failed login attempt
 */
export async function handleFailedLogin(email: string): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.rpc("handle_failed_login", {
      user_email: email,
    });

    await logSecurityEvent("failed_login", undefined, {
      email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to handle failed login:", error);
  }
}

/**
 * Handle successful login
 */
export async function handleSuccessfulLogin(
  userId: string,
  ipAddress?: string
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.rpc("handle_successful_login", {
      user_id: userId,
      ip_address: ipAddress,
    });

    await logSecurityEvent("login", userId, {
      ip_address: ipAddress,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to handle successful login:", error);
  }
}

/**
 * Check if user account is locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("status, failed_login_attempts")
      .eq("email", email)
      .single();

    return profile?.status === "locked";
  } catch (error) {
    console.error("Failed to check account lock status:", error);
    return false;
  }
}

/**
 * Unlock user account (admin function)
 */
export async function unlockAccount(userId: string): Promise<void> {
  const { user: adminUser } = await validateAdminAccess();

  const supabase = await createClient();

  await supabase
    .from("profiles")
    .update({
      status: "active",
      failed_login_attempts: 0,
    })
    .eq("id", userId);

  await logSecurityEvent("account_unlocked", userId, {
    unlocked_by: adminUser.id,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Suspend user account (admin function)
 */
export async function suspendAccount(
  userId: string,
  reason: string
): Promise<void> {
  const { user: adminUser } = await validateAdminAccess();

  const supabase = await createClient();

  await supabase
    .from("profiles")
    .update({
      status: "suspended",
    })
    .eq("id", userId);

  await logSecurityEvent("account_suspended", userId, {
    suspended_by: adminUser.id,
    reason,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Change user role (admin function)
 */
export async function changeUserRole(
  userId: string,
  newRole: string
): Promise<void> {
  const { user: adminUser } = await validateAdminAccess();

  const supabase = await createClient();

  // Get current role
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!currentProfile) {
    throw new Error("User not found");
  }

  // Update role
  await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

  await logSecurityEvent("role_change", userId, {
    changed_by: adminUser.id,
    old_role: currentProfile.role,
    new_role: newRole,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get security dashboard data (admin function)
 */
export async function getSecurityDashboard(): Promise<any> {
  await validateAdminAccess();

  const supabase = await createClient();

  // Get recent security events
  const { data: recentEvents } = await supabase
    .from("security_audit")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  // Get user statistics
  const { data: userStats } = await supabase
    .from("profiles")
    .select("status, role")
    .order("created_at", { ascending: false });

  // Get failed login attempts in last 24 hours
  const { data: failedLogins } = await supabase
    .from("security_audit")
    .select("*")
    .eq("event_type", "failed_login")
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );

  return {
    recentEvents: recentEvents || [],
    userStats: userStats || [],
    failedLogins: failedLogins || [],
    summary: {
      totalUsers: userStats?.length || 0,
      activeUsers: userStats?.filter((u) => u.status === "active").length || 0,
      suspendedUsers:
        userStats?.filter((u) => u.status === "suspended").length || 0,
      lockedUsers: userStats?.filter((u) => u.status === "locked").length || 0,
      adminUsers: userStats?.filter((u) => u.role === "admin").length || 0,
      failedLoginsToday: failedLogins?.length || 0,
    },
  };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  } else {
    score += 1;
  }

  // Common password check
  const commonPasswords = ["password", "123456", "qwerty", "admin"];
  if (
    commonPasswords.some((common) => password.toLowerCase().includes(common))
  ) {
    errors.push("Password contains common words or patterns");
    score -= 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.max(0, score),
  };
}
