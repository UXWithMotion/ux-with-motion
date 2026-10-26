import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedComponents } from "@/lib/admin/components/queries";
import { ComponentsExplorer } from "./ComponentsExplorer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Components",
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
  const components = await getPublishedComponents();

  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-[#FBFCFD]" />}>
      <ComponentsExplorer initialComponents={components} />
    </Suspense>
  );
}
