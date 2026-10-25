import type { MetadataRoute } from "next";
import { getPublishedComponents } from "@/lib/admin/components/queries";
import { componentRegistry } from "@/lib/registry/components";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.uxwithmotion.com";

  // Static marketing routes
  const staticRoutes: MetadataRoute.Sitemap = [
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
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // High-intent SEO category landing routes
  const categoryRoutes: MetadataRoute.Sitemap = [
    "buttons",
    "design-system",
    "micro-interactions",
  ].map((cat) => ({
    url: `${baseUrl}/components/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Map of component slugs to lastModified & priority
  const componentMap = new Map<string, { lastModified: Date; priority: number }>();

  // 1. Fetch live published components from Supabase
  try {
    const components = await getPublishedComponents();
    for (const comp of components || []) {
      const slug = comp.registry_id || comp.id;
      if (slug) {
        componentMap.set(slug, {
          lastModified: comp.updated_at ? new Date(comp.updated_at) : new Date(),
          priority: 0.8,
        });
      }
    }
  } catch (e) {
    console.error("Failed to load published components for sitemap:", e);
  }

  // 2. Codebase fallback if database query returned empty
  if (componentMap.size === 0) {
    Object.keys(componentRegistry).forEach((slug) => {
      if (slug !== "ai-search-toggle") {
        componentMap.set(slug, {
          lastModified: new Date(),
          priority: 0.8,
        });
      }
    });
  }

  const componentRoutes: MetadataRoute.Sitemap = Array.from(componentMap.entries()).map(
    ([slug, info]) => ({
      url: `${baseUrl}/components/${slug}`,
      lastModified: info.lastModified,
      changeFrequency: "weekly",
      priority: info.priority,
    })
  );

  return [...staticRoutes, ...categoryRoutes, ...componentRoutes];
}
