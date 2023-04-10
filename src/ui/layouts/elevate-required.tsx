import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Navigate, Outlet } from "react-router-dom";
import { useLoader } from "saga-query/react";

import { fetchCurrentToken } from "@app/auth";
import { elevateUrl, loginUrl } from "@app/routes";
import {
  selectIsElevatedTokenValid,
  selectIsUserAuthenticated,
} from "@app/token";

import { Loading } from "../shared";

export const ElevateRequired = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const isElevatedTokenValid = useSelector(selectIsElevatedTokenValid);
  const location = useLocation();

  if (loader.lastRun > 0 && !loader.isLoading && !isAuthenticated) {
    return <Navigate to={loginUrl()} />;
  }

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isElevatedTokenValid) {
    return <Navigate to={elevateUrl(location.pathname)} replace />;
  }

  return (
    <div className="w-full h-full">{children ? children : <Outlet />}</div>
  );
};
