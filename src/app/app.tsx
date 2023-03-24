import { StrictMode } from "react";
import { Provider } from "react-redux";
import type { Store } from "@reduxjs/toolkit";

import type { AppState } from "@app/types";
import { ModalPortal } from "@app/ui";

import { router } from "./router";
import { RouterProvider } from "react-router";
import { ErrorBoundary } from "@app/ui/shared/error-boundary";

export const App = ({ store }: { store: Store<AppState> }) => {
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
