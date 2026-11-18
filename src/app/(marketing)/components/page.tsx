import React from "react";
import type { Metadata } from "next";
import { getPublicCatalogComponents } from "@/lib/admin/components/queries";
import { ComponentsExplorer } from "./ComponentsExplorer";

export const metadata: Metadata = {
  title: {
    absolute: "Next.js Animated UI Components with 1-Click Copy to Figma | UX With Motion",
  },
  description:
    "Explore 30+ animated UI components and micro-interactions. Copy production-ready Next.js code or click 'Copy to Figma' to paste editable layers directly into your Figma file.",
  keywords: [
    "Next.js animated components",
    "Copy to Figma UI components",
    "motion UI library Next.js",
    "interactive UI components Figma and Next.js",
    "micro-interaction component library",
    "UX With Motion",
  ],
  alternates: {
    canonical: "https://www.uxwithmotion.com/components",
  },
  openGraph: {
    title: "Next.js Animated UI Components + 1-Click Copy to Figma | UX With Motion",
    description:
      "Bridge design and engineering: copy production-ready Next.js motion components or paste them straight into Figma in one click.",
    url: "https://www.uxwithmotion.com/components",
    siteName: "UX With Motion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js Animated UI Components + 1-Click Copy to Figma | UX With Motion",
    description:
      "Bridge design and engineering: copy production-ready Next.js motion components or paste them straight into Figma in one click.",
  },
};

export default async function ComponentsPage() {
  const components = await getPublicCatalogComponents();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "UX With Motion Component Library",
    url: "https://www.uxwithmotion.com/components",
    applicationCategory: "DeveloperApplication, DesignApplication",
    operatingSystem: "Web, Next.js, Figma",
    description:
      "A curated library of 30+ animated UI components offering both copy-paste Next.js code for developers and a one-click Copy-to-Figma feature for UI/UX designers.",
    featureList: [
      "Copy-paste Next.js animated component code",
      "One-click Copy to Figma clipboard export",
      "30+ interactive buttons, toggles, inputs, tabs, and cards",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComponentsExplorer
        initialComponents={components}
        header={
          <header className="mb-8 sm:mb-10 max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
              Motion UI Component Library
            </h1>
            <p className="mt-2 text-base text-neutral-500 max-w-xl mx-auto">
              30+ interactive buttons, inputs, and toggles. One-click copy for Next.js code and Figma.
            </p>
          </header>
        }
      />
    </>
  );
}
