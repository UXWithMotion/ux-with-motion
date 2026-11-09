import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedComponents,
  getPublishedComponentBySlug,
} from "@/lib/admin/components/queries";
import { ComponentsExplorer } from "../ComponentsExplorer";

type Props = {
  params: Promise<{ slug: string }>;
};

// High-priority SEO keywords mapped to dedicated category & intent slugs
const seoData: Record<
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
    const categorySlugs = Object.keys(seoData).map((slug) => ({ slug }));
    return [...categorySlugs, ...componentSlugs];
  } catch (e) {
    console.error("Failed to generate static params for components:", e);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categorySeo = seoData[slug];
  const comp = await getPublishedComponentBySlug(slug);

  if (categorySeo) {
    return {
      title: categorySeo.title,
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
      comp.description ||
      `Explore the ${title} UI component. Preview its live interactive design and copy-paste code for React, Framer Motion, HTML, CSS, and Figma.`;
    const keywords = [
      title.toLowerCase(),
      `${title.toLowerCase()} component`,
      "animation component",
      "best button components",
      "ux with motion",
      ...(comp.tags || []),
    ];

    const canonicalUrl = `https://www.uxwithmotion.com/components/${comp.registry_id || comp.id}`;

    return {
      title: `${title} — Animated UI Component`,
      description,
      keywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} — Animated UI Component | UX With Motion`,
        description,
        url: canonicalUrl,
        type: "article",
        siteName: "UX With Motion",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — Animated UI Component | UX With Motion`,
        description,
      },
    };
  }

  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} — Animated UI Component`,
    description: `Copy-paste the ${slug.replace(/-/g, " ")} animated component for Figma and React by UX With Motion.`,
  };
}

export default async function ComponentSlugPage({ params }: Props) {
  const { slug } = await params;
  const categorySeo = seoData[slug];
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

      {categorySeo && !comp && (
        <header className="sr-only">
          <h1>{categorySeo.h1}</h1>
          <p>{categorySeo.desc}</p>
        </header>
      )}

      {/* Interactive Client Component & Explorer UI */}
      <Suspense fallback={<div className="w-full min-h-screen bg-[#FBFCFD]" />}>
        <ComponentsExplorer
          initialComponents={allComponents}
          initialActiveSlug={comp ? slug : undefined}
        />
      </Suspense>
    </>
  );
}
