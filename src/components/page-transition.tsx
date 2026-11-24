"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

// A light fade between pages: the old page fades out quickly, the new one fades in and rises a few pixels.
// Only the address path counts, so filters and sorting (the ?query) change the list without the animation.
// Browsers without the View Transitions API simply switch pages as before. Styles: page-enter/page-exit in globals.css.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
