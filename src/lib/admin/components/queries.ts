"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/supabase/admin";

export async function getAdminComponents() {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("components")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAdminComponent(id: string) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("components")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getPublishedComponents() {
  let isAuthenticated = false;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const authSupabase = await createClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    // cookies() unavailable during static generation, sitemap, or build time
    isAuthenticated = false;
  }

  const { createServiceRoleClient } = await import("@/lib/supabase/service-role");
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("components")
    .select("*")
    .eq("status", "published")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Beta Scope: No Free-vs-Premium distinction. Signed-in users get source snippets;
  // signed-out visitors have source snippets scrubbed at the server boundary.
  const scrubbedData = data.map((comp) => {
    comp.access_tier = "free";
    if (!isAuthenticated) {
      comp.snippets = null;
      comp.is_locked = true;
    } else {
      comp.is_locked = false;
    }
    return comp;
  });

  return scrubbedData;
}

export async function getPublishedComponentBySlug(slug: string) {
  let isAuthenticated = false;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const authSupabase = await createClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    // cookies() unavailable during static generation, sitemap, or build time
    isAuthenticated = false;
  }

  const { createServiceRoleClient } = await import("@/lib/supabase/service-role");
  const supabase = createServiceRoleClient();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  let query = supabase.from("components").select("*").eq("status", "published");
  if (isUUID) {
    query = query.or(`registry_id.eq.${slug},id.eq.${slug}`);
  } else {
    query = query.eq("registry_id", slug);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Error fetching component by slug:", error);
    return null;
  }

  if (!data) return null;

  data.access_tier = "free";
  if (!isAuthenticated) {
    data.snippets = null;
    data.is_locked = true;
  } else {
    data.is_locked = false;
  }

  return data;
}
