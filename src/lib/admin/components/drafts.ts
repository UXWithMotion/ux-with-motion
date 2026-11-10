"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/supabase/admin";
import { ComponentDocs, ComponentSeo } from "@/lib/registry/types";

export interface ComponentDraftData {
  id: string;
  title: string;
  description: string;
  registry_id: string;
  source_type: "react" | "html_css" | "both";
  snippets: {
    react?: string;
    html?: string;
    css?: string;
    figma?: string;
    prompt?: string;
  };
  controls_values?: Record<string, any>;
  docs?: ComponentDocs;
  seo?: ComponentSeo;
  updated_at: string;
}

const BUCKET_NAME = "site_metrics";

export async function saveComponentDraft(id: string, data: Partial<ComponentDraftData>): Promise<{ success: boolean; savedAt: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const savedAt = new Date().toISOString();

  const draftPayload: ComponentDraftData = {
    id,
    title: data.title || "",
    description: data.description || "",
    registry_id: data.registry_id || "",
    source_type: data.source_type || "react",
    snippets: data.snippets || {},
    controls_values: data.controls_values || {},
    docs: data.docs,
    seo: data.seo,
    updated_at: savedAt,
  };

  const filePath = `drafts/${id}.json`;
  const fileBody = Buffer.from(JSON.stringify(draftPayload, null, 2), "utf-8");

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBody, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    console.error("Failed to save draft to storage:", error);
    throw new Error(`Failed to save draft: ${error.message}`);
  }

  return { success: true, savedAt };
}

export async function getComponentDraft(id: string): Promise<ComponentDraftData | null> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const filePath = `drafts/${id}.json`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error || !data) {
    return null;
  }

  try {
    const text = await data.text();
    return JSON.parse(text) as ComponentDraftData;
  } catch (err) {
    console.error("Failed to parse draft JSON:", err);
    return null;
  }
}

export async function discardComponentDraft(id: string): Promise<{ success: boolean }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const filePath = `drafts/${id}.json`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.warn("Failed to remove draft file or already absent:", error.message);
  }

  return { success: true };
}
