"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void, breakpoint: number) {
  const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function useIsMobile(breakpoint = 768) {
  return useSyncExternalStore(
    (cb) => subscribe(cb, breakpoint),
    () => window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches,
    () => false
  );
}
