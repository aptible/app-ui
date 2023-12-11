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

  // we want to flip the logic so we can set value to `isTabActive`
  return isHidden === false;
}
