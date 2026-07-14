"use client";

import { useEffect, useState } from "react";
import { MOBILE_BREAKPOINT } from "../module/workbench.types";

export function useResponsiveWorkbench() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return { isMobile };
}
