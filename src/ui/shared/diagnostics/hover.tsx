import { createContext } from "react";

export type HoverState = {
  timestamp: string | null;
  setTimestamp: (timestamp: string | null) => void;
};

export const HoverContext = createContext<HoverState>({
  timestamp: null,
  setTimestamp: () => {},
});
