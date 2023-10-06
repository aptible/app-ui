import { selectBillingDetail, selectHasPaymentMethod } from "@app/billing";
import { FETCH_REQUIRED_DATA } from "@app/bootup";
import { createLog } from "@app/debug";
import { selectLoaderById } from "@app/fx";
import { setRedirectPath } from "@app/redirect-path";
import {
  homeUrl,
  loginUrl,
  logoutUrl,
  plansUrl,
  signupUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";
import { AppState } from "@app/types";
import { selectCurrentUserId, selectIsUserVerified } from "@app/users";
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

export const VerifyEmailRequired = ({
  children,
}: { children?: React.ReactNode }) => {
  const isUserVerified = useSelector(selectIsUserVerified);
  const userId = useSelector(selectCurrentUserId);

  if (userId !== "" && !isUserVerified) {
    log("user not verified, redirecting to verify");
    return <Navigate to={verifyEmailRequestUrl()} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const PaymentMethodRequired = ({
  children,
}: { children?: React.ReactNode }) => {
  const billingDetail = useSelector(selectBillingDetail);
  const hasPaymentMethod = useSelector(selectHasPaymentMethod);

  if (billingDetail.id !== "" && !hasPaymentMethod) {
    log("user has no payment method, redirecting to billing");
    return <Navigate to={plansUrl()} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const AuthRequired = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: FETCH_REQUIRED_DATA }),
  );
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated);

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
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading text="Loading token" />
      </div>
    );
  }

  if (!isUserAuthenticated) {
    log("user not authenticating, redirecting to login");
    return <Navigate to={loginUrl()} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const AllRequired = ({ children }: { children?: React.ReactNode }) => {
  return (
    <AuthRequired>
      <VerifyEmailRequired>
        <PaymentMethodRequired>
          {children ? <>{children}</> : <Outlet />}
        </PaymentMethodRequired>
      </VerifyEmailRequired>
    </AuthRequired>
  );
};
