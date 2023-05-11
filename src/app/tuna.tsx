"use client";

import { useEffect } from "react";
import { useLocation } from "react-router";

export const Tuna = () => {
  const loc = useLocation();
  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    if (import.meta.env.VITE_TUNA_ENABLED === "true") {
      const w = window as any;
      if (w.aptible?.event) {
        w.aptible.event("pageview", null);
      }
    }
  }, [loc.pathname]);
  return null;
};
