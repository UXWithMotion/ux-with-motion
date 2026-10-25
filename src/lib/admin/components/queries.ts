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
  const { createClient } = await import("@/lib/supabase/server");
  const authSupabase = await createClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  const isAuthenticated = !!user;

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
  const scrubbedData = data.map(comp => {
    comp.access_tier = 'free';
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
