import type { Store } from "@reduxjs/toolkit";
import { StrictMode } from "react";
import { Provider, useSelector } from "react-redux";

import type { AppState } from "@app/types";
import { ModalPortal, StandaloneErrorBoundary } from "@app/ui";

import { ftuxRouter, router } from "./router";
import { selectOrigin } from "@app/env";
import { CookieNotice } from "@app/ui/shared/cookie-notice";
import {
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { RouterProvider } from "react-router";

ChartJS.register(
  CategoryScale,
  Colors,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const AppRouter = () => {
  const origin = useSelector(selectOrigin);
  return (
    <div className="h-full w-full">
      <StandaloneErrorBoundary>
        <ModalPortal />
        <CookieNotice />
      </StandaloneErrorBoundary>
      <RouterProvider router={origin === "nextgen" ? router : ftuxRouter} />
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
