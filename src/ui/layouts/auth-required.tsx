import { useLoader } from "@app/fx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { fetchCurrentToken } from "@app/auth";
import { selectEnv } from "@app/env";
import { setRedirectPath } from "@app/redirect-path";
import { loginUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

import { useVerifiedRequired } from "../hooks";
import { Loading } from "../shared";

export const AuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const config = useSelector(selectEnv);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authed = loader.isLoading || isAuthenticated;
  useVerifiedRequired();

  useEffect(() => {
    if (!authed) {
      dispatch(setRedirectPath(location.pathname));
    }
  }, [authed]);

  useEffect(() => {
    if (loader.isLoading) {
      return;
    }

    // only redirect in production
    if (
      config.isProduction &&
      config.origin === "app" &&
      !authed &&
      config.legacyDashboardUrl
    ) {
      // WARNING - this should be temporary
      // if environment featureflag for dashboard.aptible.com, we will redirect to dashboard for login
      window.location.href = config.legacyDashboardUrl;
    } else if (!authed) {
      navigate(loginUrl());
    }
  }, [config, authed, loader]);

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <Outlet />;
};
