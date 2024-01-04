import { createRoot } from "react-dom/client";
import { App } from "./app";
import { setupStore } from "./store";

export function init() {
  const store = setupStore({
    logs: import.meta.env.VITE_DEBUG === "true",
  });
  (window as any).store = store;

  const container = document.getElementById("app");
  if (!container) {
    throw new Error("#app element not found");
  }
  const root = createRoot(container);

  root.render(<App store={store} />);
}
