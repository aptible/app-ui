import { selectHasPaymentMethod } from "@app/billing";
import { FETCH_REQUIRED_DATA } from "@app/bootup";
import { createLog } from "@app/debug";
import { selectLoaderById } from "@app/fx";
import { setRedirectPath } from "@app/redirect-path";
import {
  billingMethodUrl,
  homeUrl,
  loginUrl,
  logoutUrl,
  plansUrl,
  signupUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";
import { AppState } from "@app/types";
import { selectIsUserVerified } from "@app/users";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loading } from "../shared";

const log = createLog("auth-required");
const denyList = [
  logoutUrl(),
  loginUrl(),
  signupUrl(),
  homeUrl(),
  verifyEmailRequestUrl(),
];

export const AuthRequired = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: FETCH_REQUIRED_DATA }),
  );
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated);
  const isUserVerified = useSelector(selectIsUserVerified);
  const hasPaymentMethod = useSelector(selectHasPaymentMethod);
  log({
    isUserAuthenticated,
    isUserVerified,
    hasPaymentMethod,
    loader,
    pathname: location.pathname,
  });

  useEffect(() => {
    if (
      loader.status === "success" &&
      !isUserAuthenticated &&
      !denyList.includes(location.pathname)
    ) {
      log(`setting redirect path ${location.pathname}`);
      dispatch(setRedirectPath(location.pathname));
    }
  }, [location.pathname, isUserAuthenticated, loader.status]);

  if (loader.isLoading || loader.isIdle) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isUserAuthenticated) {
    log("user not authenticating, redirecting to login");
    return <Navigate to={loginUrl()} replace />;
  }

  if (!isUserVerified && !/verify/.test(location.pathname)) {
    log("user not verified, redirecting to verify");
    return <Navigate to={verifyEmailRequestUrl()} replace />;
  }

  if (
    !hasPaymentMethod &&
    ![plansUrl(), billingMethodUrl()].includes(location.pathname)
  ) {
    log("user has no payment method, redirecting to billing");
    return <Navigate to={plansUrl()} replace />;
  }

  return <Outlet />;
};
