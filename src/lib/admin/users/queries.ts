"use server";

import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: string;
  role: "admin" | "user";
  createdAt: string;
  lastSignInAt: string | null;
  subscriptionStatus: string;
  planKey: string | null;
  emailConfirmed: boolean;
}

export interface AdminUsersStats {
  totalUsers: number;
  activeRecently: number; // Logged in within last 30 days
  googleUsers: number;
  emailUsers: number;
  adminUsers: number;
  paidUsers: number;
}

export async function getAdminUsers(): Promise<{
  users: AdminUser[];
  stats: AdminUsersStats;
}> {
  // Ensure the caller is an authenticated admin
  await requireAdmin();

  const supabase = createServiceRoleClient();

  // Fetch all users from Supabase Auth admin API (up to 1000 users per page)
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (authError) {
    throw new Error(`Failed to fetch users from auth: ${authError.message}`);
  }

  const rawUsers = authData?.users || [];

  // Concurrently fetch roles and subscriptions
  const [rolesRes, subsRes] = await Promise.all([
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("user_subscriptions").select("user_id, status, plan_key"),
  ]);

  const rolesMap = new Map<string, "admin" | "user">();
  if (rolesRes.data) {
    for (const r of rolesRes.data) {
      if (r.user_id) {
        rolesMap.set(r.user_id, (r.role as "admin" | "user") || "user");
      }
    }
  }

  const subsMap = new Map<string, { status: string; plan_key: string | null }>();
  if (subsRes.data) {
    for (const s of subsRes.data) {
      if (s.user_id) {
        subsMap.set(s.user_id, {
          status: s.status || "created",
          plan_key: s.plan_key || null,
        });
      }
    }
  }

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  let activeRecentlyCount = 0;
  let googleCount = 0;
  let emailCount = 0;
  let adminCount = 0;
  let paidCount = 0;

  const users: AdminUser[] = rawUsers.map((u) => {
    const rawRole = rolesMap.get(u.id) || "user";
    const sub = subsMap.get(u.id);

    // Provider detection
    const provider =
      u.app_metadata?.provider ||
      (Array.isArray(u.app_metadata?.providers) && u.app_metadata.providers[0]) ||
      "email";

    const isGoogle = provider.toLowerCase().includes("google");
    if (isGoogle) {
      googleCount++;
    } else {
      emailCount++;
    }

    if (rawRole === "admin") {
      adminCount++;
    }

    const subStatus = sub?.status || "free";
    const isPaid = subStatus === "active" || subStatus === "authenticated";
    if (isPaid) {
      paidCount++;
    }

    if (u.last_sign_in_at) {
      const signInTime = new Date(u.last_sign_in_at).getTime();
      if (now - signInTime <= thirtyDaysMs) {
        activeRecentlyCount++;
      }
    }

    const fullName =
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      u.email?.split("@")[0] ||
      "User";

    const avatarUrl =
      u.user_metadata?.avatar_url ||
      u.user_metadata?.picture ||
      null;

    return {
      id: u.id,
      email: u.email || "No email",
      name: fullName,
      avatarUrl,
      provider: isGoogle ? "google" : provider,
      role: rawRole,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at || null,
      subscriptionStatus: subStatus,
      planKey: sub?.plan_key || null,
      emailConfirmed: Boolean(u.email_confirmed_at),
    };
  });

  // Sort by lastSignInAt descending (most recently active users first)
  users.sort((a, b) => {
    if (!a.lastSignInAt && !b.lastSignInAt) return 0;
    if (!a.lastSignInAt) return 1;
    if (!b.lastSignInAt) return -1;
    return new Date(b.lastSignInAt).getTime() - new Date(a.lastSignInAt).getTime();
  });

  return {
    users,
    stats: {
      totalUsers: users.length,
      activeRecently: activeRecentlyCount,
      googleUsers: googleCount,
      emailUsers: emailCount,
      adminUsers: adminCount,
      paidUsers: paidCount,
    },
  };
}
