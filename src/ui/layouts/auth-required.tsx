import { fetchCurrentToken } from "@app/auth";
import { useLoader } from "@app/fx";
import { resetRedirectPath, setRedirectPath } from "@app/redirect-path";
import {
  homeUrl,
  loginUrl,
  logoutUrl,
  signupUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePaymentRequired, useVerifiedRequired } from "../hooks";
import { Loading } from "../shared";

const denyList = [
  logoutUrl(),
  loginUrl(),
  signupUrl(),
  homeUrl(),
  verifyEmailRequestUrl(),
];

const useAuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (loader.status === "loading") {
      return;
    }

    if (!isUserAuthenticated) {
      if (!denyList.includes(location.pathname)) {
        dispatch(setRedirectPath(location.pathname));
      }
      navigate(loginUrl(), { replace: true });
    } else {
      dispatch(resetRedirectPath());
    }
  }, [isUserAuthenticated, loader.status, location.pathname]);
};

export const AuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated);

  useAuthRequired();
  useVerifiedRequired();
  usePaymentRequired();

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isUserAuthenticated) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading text="Redirecting to login" />
      </div>
    );
  }

  return <Outlet />;
};
