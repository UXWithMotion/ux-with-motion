"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { componentRegistry } from "@/lib/registry/components";

export async function createComponent(data: any) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  
  const { data: existing, error: checkError } = await supabase
    .from("components")
    .select("id")
    .eq("registry_id", data.registry_id)
    .maybeSingle();

  if (checkError) {
    throw new Error("Failed to validate component registry ID uniqueness.");
  }

  if (existing) {
    throw new Error(`A component with registry ID "${data.registry_id}" already exists.`);
  }

  if (data.status === "published" && !componentRegistry[data.registry_id]) {
    throw new Error(`Cannot publish component. Missing trusted registry renderer for ID: ${data.registry_id}`);
  }
  
  const { data: result, error } = await supabase
    .from("components")
    .insert([{
      registry_id: data.registry_id,
      title: data.title,
      description: data.description,
      status: data.status,
      tags: data.tags || [],
      type: data.type || "component",
      order: data.order || 0,
      source_type: data.source_type || "react",
      snippets: data.snippets || {},
      schema_definition: data.schema_definition || []
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (result.status === "published") {
    revalidatePath("/components");
  }
  revalidatePath("/admin/components");
  
  return result;
}

export async function updateComponent(id: string, data: any) {
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

  const updatePayload: any = {
    title: data.title,
    description: data.description,
    tags: data.tags,
    type: data.type,
    order: data.order
  };

  // Prevent accidental demotion from published to draft
  if (existing.status === "published" && data.status === "draft") {
    updatePayload.status = "published";
  } else if (data.status !== undefined) {
    updatePayload.status = data.status;
  }

  
  if (data.source_type !== undefined) updatePayload.source_type = data.source_type;
  if (data.snippets !== undefined) updatePayload.snippets = data.snippets;
  if (data.schema_definition !== undefined) updatePayload.schema_definition = data.schema_definition;
  if (data.registry_id !== undefined) updatePayload.registry_id = data.registry_id;

  if (updatePayload.status === "published") {
    let targetRegistryId = updatePayload.registry_id;
    if (!targetRegistryId) {
      targetRegistryId = existing.registry_id;
    }
    if (!targetRegistryId || !componentRegistry[targetRegistryId]) {
      throw new Error(`Cannot publish component. Missing trusted registry renderer for ID: ${targetRegistryId}`);
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

  revalidatePath("/components");
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
  revalidatePath("/components");
  revalidatePath("/admin/components");
  return { success: true };
}

export async function updateComponentsOrder(updates: {id: string, order: number}[]) {
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
