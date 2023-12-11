import { useEffect, useState } from "react";

export function useVisibility() {
  const [isHidden, setHidden] = useState(document.hidden);

  useEffect(() => {
    const fn = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", fn);
    return () => {
      document.removeEventListener("visibilitychange", fn);
    };
  }, []);

  return isHidden;
}
