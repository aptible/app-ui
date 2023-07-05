import { useLoader } from "@app/fx";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { Outlet } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (loader.isLoading) {
      return;
    }

    if (loader.lastRun > 0 && !isAuthenticated) {
      navigate(loginUrl());
      return;
    }

    if (!isElevatedTokenValid) {
      navigate(elevateUrl(location.pathname), { replace: true });
      return;
    }
  }, [loader, isAuthenticated, isElevatedTokenValid]);

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full h-full">{children ? children : <Outlet />}</div>
  );
};
