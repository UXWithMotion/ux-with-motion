import type { MetadataRoute } from "next";
import { getPublishedComponents } from "@/lib/admin/components/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.uxwithmotion.com";

  let componentEntries: MetadataRoute.Sitemap = [];
  try {
    const components = await getPublishedComponents();
    componentEntries = (components || []).map((comp) => ({
      url: `${baseUrl}/components/${comp.registry_id || comp.id}`,
      lastModified: comp.updated_at ? new Date(comp.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Failed to load components for sitemap:", e);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/components`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...componentEntries,
  ];
}


