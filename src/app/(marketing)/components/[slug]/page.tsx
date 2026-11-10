import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedComponents,
  getPublishedComponentBySlug,
} from "@/lib/admin/components/queries";
import { componentRegistry } from "@/lib/registry/components";
import { ComponentsExplorer } from "../ComponentsExplorer";

type Props = {
  params: Promise<{ slug: string }>;
};

// High-priority SEO keywords mapped to dedicated category & intent slugs
const seoCategories: Record<
  string,
  { title: string; h1: string; desc: string; keywords: string[] }
> = {
  buttons: {
    title: "Best Animated Button Components for React, Tailwind & Figma",
    h1: "Animated Button Components (Figma & React)",
    desc: "Copy-paste the best interactive button components with hover physics, magnetic motion, and design system tokens for Figma and React.",
    keywords: [
      "best button components",
      "animated button component",
      "react button animation",
      "figma interactive buttons",
    ],
  },
  "design-system": {
    title: "Design System Based Components with Built-In Motion (Figma & React)",
    h1: "Design System Based Motion Components",
    desc: "Production-ready design system UI components with standardized motion tokens, spring physics, and accessible states for Figma and Next.js.",
    keywords: [
      "design system based components",
      "motion design system",
      "figma component library",
      "react ui kit",
    ],
  },
  "micro-interactions": {
    title: "50+ UI Animation Components & Copy-Paste Micro-Interactions",
    h1: "UI Animation Components & Micro-Interactions",
    desc: "Explore reusable animation components for modern web apps. Copy-paste Framer Motion, Tailwind CSS, and Figma smart animate components.",
    keywords: [
      "animation component",
      "ui micro-interactions",
      "framer motion components",
      "ux with motion",
    ],
  },
};

export async function generateStaticParams() {
  try {
    const components = await getPublishedComponents();
    const componentSlugs = (components || []).map((comp) => ({
      slug: comp.registry_id || comp.id,
    }));
    const categorySlugs = Object.keys(seoCategories).map((slug) => ({ slug }));
    return [...categorySlugs, ...componentSlugs];
  } catch (e) {
    console.error("Failed to generate static params for components:", e);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categorySeo = seoCategories[slug];
  const comp = await getPublishedComponentBySlug(slug);
  const registryEntry = comp?.registry_id ? componentRegistry[comp.registry_id] : undefined;

  if (categorySeo) {
    return {
      title: `${categorySeo.title} | UX With Motion`,
      description: categorySeo.desc,
      keywords: categorySeo.keywords,
      alternates: {
        canonical: `https://www.uxwithmotion.com/components/${slug}`,
      },
      openGraph: {
        title: `${categorySeo.title} | UX With Motion`,
        description: categorySeo.desc,
        url: `https://www.uxwithmotion.com/components/${slug}`,
        type: "website",
        siteName: "UX With Motion",
      },
      twitter: {
        card: "summary_large_image",
        title: `${categorySeo.title} | UX With Motion`,
        description: categorySeo.desc,
      },
    };
  }

  if (comp) {
    const title = comp.title;
    const description =
      registryEntry?.seo?.metaDescription ||
      comp.description ||
      `Explore the ${title} UI component. Preview its live interactive design and copy-paste code for React, Framer Motion, and Tailwind CSS.`;

    const canonicalUrl = `https://www.uxwithmotion.com/components/${comp.registry_id || comp.id}`;
    const pageTitle = registryEntry?.seo?.seoTitle || `${title} — Animated UI Component | UX With Motion`;

    return {
      title: pageTitle,
      description,
      keywords: [
        title.toLowerCase(),
        `${title.toLowerCase()} component`,
        "animation component",
        "react motion component",
        "ux with motion",
        ...(comp.tags || []),
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: pageTitle,
        description,
        url: canonicalUrl,
        type: "article",
        siteName: "UX With Motion",
        images: registryEntry?.seo?.shareImage ? [{ url: registryEntry.seo.shareImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description,
      },
    };
  }

  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} — Animated UI Component | UX With Motion`,
    description: `Copy-paste the ${slug.replace(/-/g, " ")} animated component for React and Tailwind CSS by UX With Motion.`,
    alternates: {
      canonical: `https://www.uxwithmotion.com/components/${slug}`,
    },
  };
}

export default async function ComponentSlugPage({ params }: Props) {
  const { slug } = await params;
  const categorySeo = seoCategories[slug];
  const [comp, allComponents] = await Promise.all([
    getPublishedComponentBySlug(slug),
    getPublishedComponents(),
  ]);

  if (!comp && !categorySeo) {
    notFound();
  }

  const jsonLd = categorySeo
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: categorySeo.title,
        description: categorySeo.desc,
        url: `https://www.uxwithmotion.com/components/${slug}`,
        publisher: {
          "@type": "Organization",
          name: "UX With Motion",
          url: "https://www.uxwithmotion.com/",
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: comp?.title,
        description:
          comp?.description ||
          `Interactive ${comp?.title} component by UX With Motion`,
        codeRepository: `https://www.uxwithmotion.com/components/${comp?.registry_id || comp?.id}`,
        programmingLanguage: "React, Tailwind CSS, Framer Motion",
        author: {
          "@type": "Organization",
          name: "UX With Motion",
          url: "https://www.uxwithmotion.com/",
        },
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Semantic accessible header for search engines & assistive tech */}
      <header className="sr-only">
        <h1>{categorySeo ? categorySeo.h1 : comp?.title}</h1>
        <p>{categorySeo ? categorySeo.desc : comp?.description}</p>
      </header>

      {/* Interactive Components Explorer with active modal for this component */}
      <Suspense fallback={<div className="w-full min-h-screen bg-[#FBFCFD]" />}>
        <ComponentsExplorer
          initialComponents={allComponents}
          initialActiveSlug={comp ? slug : undefined}
        />
      </Suspense>
    </>
  );
}
