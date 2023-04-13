import type { Store } from "@reduxjs/toolkit";
import { StrictMode } from "react";
import { Provider, useSelector } from "react-redux";

import type { AppState } from "@app/types";
import { ModalPortal } from "@app/ui";

import { ftuxRouter, router } from "./router";
import { selectOrigin } from "@app/env";
import { ErrorBoundary } from "@app/ui/shared/error-boundary";
import { RouterProvider } from "react-router";

const AppRouter = () => {
  const origin = useSelector(selectOrigin);
  return (
    <div className="h-full w-full">
      <ModalPortal />
      <RouterProvider router={origin === "nextgen" ? router : ftuxRouter} />
    </div>
  );
};

export const App = ({ store }: { store: Store<AppState> }) => {
  // ErrorBoundary is set here if there are errors in the router and/or provider
  return (
    <StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <AppRouter />
        </Provider>
      </ErrorBoundary>
    </StrictMode>
  );
};
