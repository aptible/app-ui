import { useLoader } from "@app/fx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { fetchCurrentToken } from "@app/auth";
import { setRedirectPath } from "@app/redirect-path";
import { loginUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

import { useVerifiedRequired } from "../hooks";
import { Loading } from "../shared";

export const AuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
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

    if (!authed) {
      navigate(loginUrl());
    }
  }, [authed, loader]);

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <Outlet />;
};
