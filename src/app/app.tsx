import { FxStore } from "@app/fx";
import { PersistGate, Provider } from "@app/react";
import { WebState, schema } from "@app/schema";
import {
  CookieNotice,
  Loading,
  ModalPortal,
  StandaloneErrorBoundary,
} from "@app/ui";
import { StrictMode } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router";

export const AppRouter = () => {
  return (
    <div className="h-full w-full">
      <StandaloneErrorBoundary>
        <ModalPortal />
        <CookieNotice />
      </StandaloneErrorBoundary>
      <RouterProvider router={router} />
    </div>
  );
};

export const App = ({ store }: { store: FxStore<WebState> }) => {
  return (
    <StrictMode>
      <Provider schema={schema} store={store}>
        <PersistGate loading={<Loading />}>
          <AppRouter />
        </PersistGate>
      </Provider>
    </StrictMode>
  );
};
