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

export async function generateStaticParams() {
  try {
    const components = await getPublishedComponents();
    return (components || []).map((comp) => ({
      slug: comp.registry_id || comp.id,
    }));
  } catch (e) {
    console.error("Failed to generate static params for components:", e);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = await getPublishedComponentBySlug(slug);

  if (!comp) {
    return {
      title: "Component Not Found",
    };
  }

  const title = comp.title;
  const description =
    comp.description ||
    `Explore the ${title} UI component. Preview its live interactive design and copy-paste code for React, Framer Motion, HTML, CSS, and Figma.`;

  const canonicalUrl = `https://www.uxwithmotion.com/components/${slug}`;

  return {
    title: `${title} — UI Component`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} — UI Component | UX With Motion`,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "uxwithmotion — UX With Motion",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — UI Component | UX With Motion`,
      description,
    },
  };
}

export default async function ComponentSlugPage({ params }: Props) {
  const { slug } = await params;
  const [comp, allComponents] = await Promise.all([
    getPublishedComponentBySlug(slug),
    getPublishedComponents(),
  ]);

  if (!comp) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: comp.title,
    description: comp.description || `Interactive ${comp.title} component by UX With Motion`,
    codeRepository: `https://www.uxwithmotion.com/components/${slug}`,
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

      {/* Semantic markup for search engines and crawlers */}
      <article className="sr-only">
        <h1>{comp.title}</h1>
        <p>{comp.description}</p>
        {comp.tags && comp.tags.length > 0 && <p>Tags: {comp.tags.join(", ")}</p>}
        {comp.snippets?.react && (
          <section>
            <h2>React Code</h2>
            <pre>
              <code>{comp.snippets.react}</code>
            </pre>
          </section>
        )}
        {comp.snippets?.html && (
          <section>
            <h2>HTML Code</h2>
            <pre>
              <code>{comp.snippets.html}</code>
            </pre>
          </section>
        )}
      </article>

      <Suspense fallback={<div className="w-full min-h-screen bg-[#FBFCFD]" />}>
        <ComponentsExplorer
          initialComponents={allComponents}
          initialActiveSlug={slug}
        />
      </Suspense>
    </>
  );
}

