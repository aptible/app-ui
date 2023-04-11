import type { Store } from "@reduxjs/toolkit";
import { StrictMode } from "react";
import { Provider } from "react-redux";

import type { AppState } from "@app/types";
import { ModalPortal } from "@app/ui";

import { router } from "./router";
import { ErrorBoundary } from "@app/ui/shared/error-boundary";
import { RouterProvider } from "react-router";

export const App = ({ store }: { store: Store<AppState> }) => {
  // ErrorBoundary is set here if there are errors in the router and/or provider
  return (
    <StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <div className="h-full w-full">
            <ModalPortal />
            <RouterProvider router={router} />
          </div>
        </Provider>
      </ErrorBoundary>
    </StrictMode>
  );
};
