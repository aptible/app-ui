import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useLoader } from "saga-query/react";

import { fetchCurrentToken } from "@app/auth";
import { loginUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

import { Loading } from "../shared";
import { setRedirectPath } from "@app/redirect-path";
import { useEffect } from "react";

export const AuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const location = useLocation();
  const dispatch = useDispatch();
  const authed = loader.isLoading || isAuthenticated;

  useEffect(() => {
    if (!authed) {
      dispatch(setRedirectPath(location.pathname));
    }
  }, [authed]);

  if (!authed) {
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
