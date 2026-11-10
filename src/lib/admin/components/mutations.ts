"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { componentRegistry } from "@/lib/registry/components";
import { saveComponentDraft, discardComponentDraft } from "./drafts";
import { ComponentDocs, ComponentSeo } from "@/lib/registry/types";

const RESERVED_SLUGS = new Set([
  "buttons",
  "design-system",
  "micro-interactions",
  "admin",
  "api",
  "login",
  "auth",
  "sitemap.xml",
  "robots.txt",
  "components",
  "privacy",
  "terms",
]);

export interface ComponentMutationPayload {
  title?: string;
  description?: string;
  registry_id?: string;
  source_type?: "react" | "html_css" | "both";
  snippets?: {
    react?: string;
    html?: string;
    css?: string;
    figma?: string;
    prompt?: string;
  };
  schema_definition?: unknown[];
  controls_values?: Record<string, any>;
  docs?: ComponentDocs;
  seo?: ComponentSeo;
  status?: "draft" | "published" | "archived";
  tags?: string[];
  type?: string;
  order?: number;
  access_tier?: "free" | "premium";
}

export async function createComponent(data: ComponentMutationPayload) {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const registryId = (data.registry_id || "").trim().toLowerCase();
  if (!registryId) {
    throw new Error("Registry ID is required.");
  }

  if (RESERVED_SLUGS.has(registryId)) {
    throw new Error(`The slug "${registryId}" is a reserved system route. Please choose a different registry ID.`);
  }

  const { data: existing, error: checkError } = await supabase
    .from("components")
    .select("id")
    .eq("registry_id", registryId)
    .maybeSingle();

  if (checkError) {
    throw new Error("Failed to validate component registry ID uniqueness.");
  }

  if (existing) {
    throw new Error(`A component with registry ID "${registryId}" already exists.`);
  }

  if (data.status === "published" && data.source_type === "react" && !componentRegistry[registryId]) {
    throw new Error(`Cannot publish component. Missing trusted registry renderer for ID: ${registryId}`);
  }

  const { data: result, error } = await supabase
    .from("components")
    .insert([{
      registry_id: registryId,
      title: data.title,
      description: data.description,
      status: data.status || "draft",
      tags: data.tags || [],
      type: data.type || "component",
      order: data.order || 0,
      source_type: data.source_type || "react",
      snippets: data.snippets || {},
      schema_definition: data.schema_definition || [],
      access_tier: data.access_tier || "free"
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (result.status === "published") {
    revalidatePath("/components");
    revalidatePath(`/components/${registryId}`);
    revalidatePath("/sitemap.xml");
  }
  revalidatePath("/admin/components");

  return result;
}

export async function saveDraftOrUpdate(id: string, data: ComponentMutationPayload) {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { data: existing, error: existingError } = await supabase
    .from("components")
    .select("status, registry_id")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    throw new Error("Component not found");
  }

  // If already published, saving draft must persist privately and NOT leak to public site
  if (existing.status === "published") {
    await saveComponentDraft(id, {
      id,
      title: data.title,
      description: data.description,
      registry_id: data.registry_id || existing.registry_id,
      source_type: data.source_type,
      snippets: data.snippets,
      controls_values: data.controls_values,
      docs: data.docs,
      seo: data.seo,
    });
    return { id, isDraft: true, message: "Draft changes saved privately." };
  }

  // Otherwise, it is a draft component; update the draft in database
  return updateComponent(id, data);
}

export async function updateComponent(id: string, data: ComponentMutationPayload) {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { data: existing, error: existingError } = await supabase
    .from("components")
    .select("status, registry_id, title")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    throw new Error("Component not found");
  }

  const targetRegistryId = (data.registry_id || existing.registry_id || "").trim().toLowerCase();

  // Validate reserved routes if slug is changing
  if (data.registry_id && data.registry_id !== existing.registry_id) {
    if (RESERVED_SLUGS.has(targetRegistryId)) {
      throw new Error(`The slug "${targetRegistryId}" is a reserved system route.`);
    }

    const { data: duplicate } = await supabase
      .from("components")
      .select("id")
      .eq("registry_id", targetRegistryId)
      .neq("id", id)
      .maybeSingle();

    if (duplicate) {
      throw new Error(`A component with registry ID "${targetRegistryId}" already exists.`);
    }
  }

  const updatePayload: Record<string, unknown> = {
    title: data.title !== undefined ? data.title : existing.title,
    description: data.description,
    tags: data.tags,
    type: data.type,
    order: data.order,
  };

  if (data.status !== undefined) {
    updatePayload.status = data.status;
  }

  if (data.source_type !== undefined) updatePayload.source_type = data.source_type;
  if (data.snippets !== undefined) updatePayload.snippets = data.snippets;
  if (data.schema_definition !== undefined) updatePayload.schema_definition = data.schema_definition;
  if (data.registry_id !== undefined) updatePayload.registry_id = targetRegistryId;
  if (data.access_tier !== undefined) updatePayload.access_tier = data.access_tier;

  // Validation when publishing
  if (updatePayload.status === "published") {
    if (!targetRegistryId) {
      throw new Error("Registry ID is required to publish a component.");
    }

    if (updatePayload.source_type === "react" || !updatePayload.source_type) {
      if (!componentRegistry[targetRegistryId]) {
        throw new Error(`Cannot publish component. Missing trusted registry renderer for ID: ${targetRegistryId}`);
      }
    }
  }

  const { data: result, error } = await supabase
    .from("components")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Clean up any storage draft since the changes are now officially published/persisted
  if (result.status === "published") {
    await discardComponentDraft(id);
  }

  revalidatePath("/components");
  revalidatePath(`/components/${targetRegistryId}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/components");
  revalidatePath(`/admin/components/${id}/edit`);

  return result;
}

export async function publishComponent(id: string) {
  return updateComponent(id, { status: "published" });
}

export async function archiveComponent(id: string) {
  return updateComponent(id, { status: "archived" });
}

export async function deleteComponent(id: string) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("components").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await discardComponentDraft(id);
  revalidatePath("/components");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/components");
  return { success: true };
}

export async function updateComponentsOrder(updates: { id: string; order: number }[]) {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  await Promise.all(
    updates.map(async (u) => {
      const { error } = await supabase
        .from("components")
        .update({ order: u.order, updated_at: new Date().toISOString() })
        .eq("id", u.id);
      if (error) throw new Error(`Failed to update order for ${u.id}: ${error.message}`);
    })
  );

  revalidatePath("/components");
  revalidatePath("/components", "page");
  revalidatePath("/admin/components");
  revalidatePath("/admin/components", "page");
  return { success: true };
}

export async function resetComponentsToDefaultOrder() {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { data: allComponents, error: fetchErr } = await supabase
    .from("components")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  if (fetchErr) {
    throw new Error(`Failed to fetch components: ${fetchErr.message}`);
  }

  if (allComponents && allComponents.length > 0) {
    await Promise.all(
      allComponents.map(async (comp, i) => {
        const { error } = await supabase
          .from("components")
          .update({ order: i, updated_at: new Date().toISOString() })
          .eq("id", comp.id);
        if (error) throw new Error(`Failed to update order for ${comp.id}: ${error.message}`);
      })
    );
  }

  revalidatePath("/components");
  revalidatePath("/components", "page");
  revalidatePath("/admin/components");
  revalidatePath("/admin/components", "page");
  return { success: true };
}
