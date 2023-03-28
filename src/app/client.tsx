import { PersistGate } from "redux-persist/integration/react";
import { createRoot } from "react-dom/client";

import { bootup } from "@app/bootup";
import { Loading } from "@app/ui";

import { setupStore } from "./store";
import { App } from "./app";
import { rootEntities } from "./packages";

export function init() {
  const { store, persistor } = setupStore({
    initState: { entities: rootEntities },
  });
  (window as any).reduxStore = store;
  store.dispatch(bootup());

  const container = document.getElementById("app");
  if (!container) {
    throw new Error("#app element not found");
  }
  const root = createRoot(container);

  root.render(
    <PersistGate loading={<Loading />} persistor={persistor}>
      <App store={store} />
    </PersistGate>,
  );
}
