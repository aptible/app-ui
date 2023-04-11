import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useLoader } from "saga-query/react";

import { fetchCurrentToken } from "@app/auth";
import { loginUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

import { Loading } from "../shared";
import { selectLegacyDashboardUrl } from "@app/env";
import { setRedirectPath } from "@app/redirect-path";
import { useEffect } from "react";

export const AuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const dashboardUrl = useSelector(selectLegacyDashboardUrl);
  const location = useLocation();
  const dispatch = useDispatch();
  const authed = loader.isLoading || isAuthenticated;

  useEffect(() => {
    if (!authed) {
      dispatch(setRedirectPath(location.pathname));
    }
  }, [authed]);

  if (!authed && dashboardUrl) {
    // WARNING - this should be temporary
    // if environment featureflag for dashboard.aptible.com, we will redirect to dashboard for login
    window.location.href = dashboardUrl;
  } else if (!authed) {
    return <Navigate to={loginUrl()} />;
  }

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <Outlet />;
};
