import type { MetadataRoute } from "next";
import { getPublishedComponents } from "@/lib/admin/components/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.uxwithmotion.com";
  const publicPaths = [
    "",
    "/components",
    "/pricing",
    "/contact",
    "/components/buttons",
    "/components/design-system",
    "/components/micro-interactions",
  ];
  const routes = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const path of publicPaths) {
    const url = `${baseUrl}${path}`;
    routes.set(url, { url });
  }

  // Component pages resolve published records, so list only those records.
  try {
    const components = await getPublishedComponents();
    for (const component of components) {
      const slug = component.registry_id || component.id;
      const url = `${baseUrl}/components/${slug}`;
      if (slug && !routes.has(url)) {
        routes.set(url, {
          url,
          lastModified: component.updated_at || undefined,
        });
      }
    }
  } catch (e) {
    console.error("Failed to load published components for sitemap:", e);
  }

  return Array.from(routes.values());
}
