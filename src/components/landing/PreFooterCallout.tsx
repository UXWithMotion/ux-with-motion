import React from "react";
import { Container } from "@/components/ui/Container";
import { ExploreButton } from "@/components/ui/ExploreButton";

export function PreFooterCallout() {
  return (
    <section
      id="explore-callout"
      className="w-full bg-[#1F2123] py-16 sm:py-20 md:py-[88px] lg:py-[101px]"
      data-node-id="1023:2991"
    >
      <Container className="flex flex-col items-center text-center">
        {/* Callout Heading (Figma: GC Gudlak Bold / 61px on desktop, white text, max-w-[956px]) */}
        <h2 className="font-title font-bold text-[32px] sm:text-[44px] md:text-[61px] leading-[1.15] text-white tracking-[-0.02em] text-balance max-w-[956px] mx-auto mb-8 md:mb-10">
          Explore micro interactions.
        </h2>

        {/* Existing Reusable Explore Component CTA (Figma Frame 5030 / Node 1023:2992) */}
        <div className="flex justify-center">
          <ExploreButton href="#components" label="Explore component" />
        </div>
      </Container>
    </section>
  );
}

