import { tunaEvent } from "@app/tuna";
import { useEffect } from "react";
import { useLocation } from "react-router";

export const Tuna = () => {
  const loc = useLocation();
  useEffect(() => {
    tunaEvent("pageview", loc.pathname);
  }, [loc.pathname]);
  return null;
};
