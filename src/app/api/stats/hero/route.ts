import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getLiveTotalVisitors } from "@/lib/stats/visitors";

export const dynamic = "force-dynamic";

// In-memory visitor session tracker for the last 30 minutes
const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const activeSessions = new Map<string, number>();
const knownVisitorIps = new Map<string, number>();

function cleanOldSessions(now: number) {
  for (const [key, timestamp] of activeSessions.entries()) {
    if (now - timestamp > THIRTY_MINUTES_MS) {
      activeSessions.delete(key);
    }
  }
  for (const [key, timestamp] of knownVisitorIps.entries()) {
    if (now - timestamp > ONE_DAY_MS) {
      knownVisitorIps.delete(key);
    }
  }
}

export async function GET(request: Request) {
  const now = Date.now();
  cleanOldSessions(now);

  // Extract client identity
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "";
  const clientKey = `${ip}-${userAgent.slice(0, 32)}`;

  // Record active session for last 30 minutes
  activeSessions.set(clientKey, now);

  // Check visitor cookie or IP to determine if this is a new visitor
  const cookieHeader = request.headers.get("cookie") || "";
  const hasVisitorCookie = /(?:^|;\s*)uxwm_vid=([^;]+)/.test(cookieHeader);
  const isKnownIp = knownVisitorIps.has(clientKey);

  const isNewVisitor = !hasVisitorCookie && !isKnownIp;
  if (isNewVisitor) {
    knownVisitorIps.set(clientKey, now);
  }

  // Get live total visitors count (increments if new visitor)
  const totalVisitors = await getLiveTotalVisitors(isNewVisitor);
  const formattedTotalVisitors = `${totalVisitors.toLocaleString()} total visitors`;

  // Query Supabase for active users and members today
  let activeLoggedInCount = 0;
  let membersTodayCount = 0;

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (!error && data?.users) {
      const thirtyMinAgo = now - THIRTY_MINUTES_MS;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayMs = startOfToday.getTime();

      for (const user of data.users) {
        if (user.last_sign_in_at) {
          const signInMs = new Date(user.last_sign_in_at).getTime();
          if (signInMs >= thirtyMinAgo) {
            activeLoggedInCount++;
          }
          if (signInMs >= startOfTodayMs) {
            membersTodayCount++;
          }
        }
      }
    }
  } catch (err) {
    console.error("Error fetching user stats from Supabase:", err);
  }

  // Active users in last 30 min (combining active visitor sessions and logged-in users, minimum 1 for current visitor)
  const activeUsers = Math.max(activeSessions.size, activeLoggedInCount, 1);
  const activeText = `${activeUsers} active user${activeUsers === 1 ? "" : "s"}`;

  // Members today or live total visitors fallback
  const membersText =
    membersTodayCount >= 3
      ? `${membersTodayCount} members today`
      : formattedTotalVisitors;

  const response = NextResponse.json({
    activeUsers,
    membersToday: membersTodayCount,
    totalVisitors,
    activeText,
    membersText,
    totalVisitorsText: formattedTotalVisitors,
  });

  // Assign visitor cookie for returning visitors
  if (!hasVisitorCookie) {
    response.cookies.set("uxwm_vid", crypto.randomUUID(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
  }

  return response;
}
