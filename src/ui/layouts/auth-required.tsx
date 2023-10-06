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
import { selectAccessToken } from "@app/token";
import { AppState } from "@app/types";
import { selectCurrentUser, selectIsUserVerified } from "@app/users";
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
  const user = useSelector(selectCurrentUser);

  if (user.id !== "" && !isUserVerified) {
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

/*
 We need to accommodate the current redirects:

- User is not authenticated -> go to `/login`
- User is not verified -> go to `/verify`
- User has no payment method -> go to `/billing`
- User doesn't have an elevated token -> go to `/elevate`

This turned into quite an exploration and I had multiple existential crises.
I tried multiple different ways to streamline our forced redirects
and this current implementation was the one that won.

# How do forced redirects work?

We have a couple react components that will check for critical pieces
of data.  If that data meets the requirements for a forced redirect,
we render `<Navigate to={...} />`.

At the time of writing this we have 4 forced redirect components:

- `<AuthRequired />` -> checks for access token
- `<EmailVerifyRequired />` -> checks for `user.verified === true`
- `<PaymentMethodRequired />` -> checks for `billing_detail._links.payment_methods.href`
- `<ElevateRequired />` -> checks for an elevated token in our redux store

# Design Principle

We store the user's access token inside local storage.  This allows us
to check for access token before we fetch `/current_token`.  While that
request is in-flight and there is an access token in our store, we start
rendering the app.  Only after `/current_token` returns `401` do we reset
the store and force the user to `/login`.

This provides us with some unique features:
- We don't block the user if we already have an access token in our redux store
- We render the page they are requesting immediately, which means we try
  to fetch that data first before all of our other preloaded data (e.g.
  user goes to app-detail page, we fetch that specific app via API before
  we fetch preloaded data, making the page render faster).
*/
export const AuthRequired = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: FETCH_REQUIRED_DATA }),
  );
  const accessToken = useSelector(selectAccessToken);

  useEffect(() => {
    if (
      loader.status === "success" &&
      accessToken === "" &&
      !denyList.includes(location.pathname)
    ) {
      log(`setting redirect path ${location.pathname}`);
      dispatch(setRedirectPath(location.pathname));
    }
  }, [location.pathname, accessToken, loader.status]);

  if (accessToken === "" && loader.lastSuccess > 0) {
    log("user not authenticated, redirecting to login");
    return <Navigate to={loginUrl()} replace />;
  }

  if (accessToken === "") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading text="Loading token" />
      </div>
    );
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
