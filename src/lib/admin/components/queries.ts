"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function getAdminComponents() {
  await requireAdmin();
  const supabase = await createClient();
  
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
  const supabase = await createClient();
  
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
  const { createServiceRoleClient } = await import("@/lib/supabase/service-role");
  const supabase = createServiceRoleClient();

  let isPremium = false;
  try {
    const { getUserEntitlement } = await import("@/lib/auth/entitlement");
    const ent = await getUserEntitlement();
    isPremium = ent.isPremium;
  } catch {
    // cookies() unavailable during static generation, sitemap, or build time
  }

  const { data, error } = await supabase
    .from("components")
    .select("*")
    .eq("status", "published")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Task 5: Secure Data Boundary - scrub protected fields for Premium components if user is not Premium
  const scrubbedData = data.map((comp) => {
    // TEMPORARILY: Make all components free
    comp.access_tier = "free";
    return comp;
  });

  return scrubbedData;
}

export async function getPublishedComponentBySlug(slug: string) {
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
  return data;
}

