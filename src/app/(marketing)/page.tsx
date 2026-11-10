import React from "react";
import { Hero } from "@/components/landing/Hero";
import { FeaturedComponents } from "@/components/landing/FeaturedComponents";
import { BentoSection } from "@/components/landing/BentoSection";
// import { ComponentPickerSection } from "@/components/landing/ComponentPickerSection";
import { PreFooterCallout } from "@/components/landing/PreFooterCallout";
import { getPublicCatalogComponents } from "@/lib/admin/components/queries";

export default async function HomePage() {
  const allComponents = await getPublicCatalogComponents();
  const featuredComponents = (allComponents || []).slice(0, 6);

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Featured Components (Top 6 interactive component cards + Explore more CTA) */}
      <FeaturedComponents
        initialComponents={featuredComponents}
        title="Components that feel alive."
      />

      {/* 3. Bento Grid / Button Showcase Section (Crafted button components) */}
      <BentoSection />

      {/* 4. Pre-Footer Callout Section */}
      <PreFooterCallout />
    </div>
  );
}

