import type { AppState } from "@app/types";
import { CookieNotice, ModalPortal, StandaloneErrorBoundary } from "@app/ui";
import type { Store } from "@reduxjs/toolkit";
import { StrictMode } from "react";
import { Provider } from "react-redux";
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

export const App = ({ store }: { store: Store<AppState> }) => {
  return (
    <StrictMode>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </StrictMode>
  );
};
