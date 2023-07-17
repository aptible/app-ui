import type { Store } from "@reduxjs/toolkit";
import { StrictMode } from "react";
import { Provider } from "react-redux";

import type { AppState } from "@app/types";
import { ModalPortal, StandaloneErrorBoundary } from "@app/ui";

import { router } from "./router";
import { CookieNotice } from "@app/ui/shared/cookie-notice";
import { RouterProvider } from "react-router";

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

export const App = ({ store }: { store: Store<AppState> }) => {
  return (
    <StrictMode>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </StrictMode>
  );
};
