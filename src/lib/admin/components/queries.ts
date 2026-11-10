"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/supabase/admin";
import { unstable_cache } from "next/cache";

export type PublicCatalogCard = {
  id: string;
  title: string;
  registry_id: string;
  description?: string;
  tags?: string[];
  order?: number;
  type?: string;
  status: string;
  source_type?: string;
  access_tier?: "free" | "premium";
  is_locked?: boolean;
  snippets?: any;
  schema_definition?: any[];
  updated_at?: string;
};

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

/**
 * Cached public catalog query.
 * Selects only the lightweight fields needed for component cards:
 * Excludes heavy raw source strings, avoids synchronous auth checks, and caches the result.
 */
export const getPublicCatalogComponents = unstable_cache(
  async (): Promise<PublicCatalogCard[]> => {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("components")
      .select("id, title, description, registry_id, tags, order, type, status, source_type, schema_definition, updated_at")
      .eq("status", "published")
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load public catalog from DB:", error);
      return [];
    }

    return (data || []).map((comp) => ({
      id: comp.id,
      title: comp.title,
      description: comp.description || "",
      registry_id: comp.registry_id,
      tags: comp.tags || [],
      order: comp.order ?? 0,
      type: comp.type || "component",
      status: comp.status,
      source_type: comp.source_type || "react",
      access_tier: "free",
      is_locked: false,
      snippets: null,
      schema_definition: comp.schema_definition || [],
      updated_at: comp.updated_at,
    }));
  },
  ["public-components-catalog"],
  {
    revalidate: 3600, // Background ISR fallback (1 hr)
    tags: ["public-components-catalog"],
  }
);

/**
 * Backward-compatible wrapper returning cached public catalog data immediately.
 */
export async function getPublishedComponents() {
  return getPublicCatalogComponents();
}

/**
 * Fetches a single published component metadata by slug or ID.
 * Excludes heavy snippets (which are fetched on-demand via /api/components/[slug]/source).
 */
export async function getPublishedComponentBySlug(slug: string): Promise<PublicCatalogCard | null> {
  const supabase = createServiceRoleClient();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  let query = supabase
    .from("components")
    .select("id, title, description, registry_id, tags, order, type, status, source_type, schema_definition")
    .eq("status", "published");

  if (isUUID) {
    query = query.or(`registry_id.eq.${slug},id.eq.${slug}`);
  } else {
    query = query.eq("registry_id", slug);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    if (error) console.error("Error fetching component by slug:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description || "",
    registry_id: data.registry_id,
    tags: data.tags || [],
    order: data.order ?? 0,
    type: data.type || "component",
    status: data.status,
    source_type: data.source_type || "react",
    access_tier: "free",
    is_locked: false,
    snippets: null,
    schema_definition: data.schema_definition || [],
  };
}
