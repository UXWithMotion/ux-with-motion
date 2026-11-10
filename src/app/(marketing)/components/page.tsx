import React from "react";
import type { Metadata } from "next";
import { getPublicCatalogComponents } from "@/lib/admin/components/queries";
import { ComponentsExplorer } from "./ComponentsExplorer";

export const metadata: Metadata = {
  title: "Animated UI Components",
  description:
    "Browse 50+ animated, interactive UI components crafted by UX With Motion (uxwithmotion). Copy-paste React, Framer Motion, HTML, CSS, and Figma micro-interactions.",
  alternates: {
    canonical: "https://www.uxwithmotion.com/components",
  },
  openGraph: {
    title: "UI Components | uxwithmotion — UX With Motion",
    description:
      "Browse 50+ animated, interactive UI components crafted by UX With Motion (uxwithmotion). Copy-paste React, Framer Motion, HTML, CSS, and Figma micro-interactions.",
    url: "https://www.uxwithmotion.com/components",
  },
};

export default async function ComponentsPage() {
  const components = await getPublicCatalogComponents();

  return (
    <>
      <h1 className="sr-only">Animated UI Components</h1>
      <ComponentsExplorer initialComponents={components} />
    </>
  );
}
