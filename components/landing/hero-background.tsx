"use client";

import { HeroGL } from "./gl";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
      <HeroGL />
    </div>
  );
}
