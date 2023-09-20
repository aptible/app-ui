import { fetchCurrentToken } from "@app/auth";
import { useLoader } from "@app/fx";
import { resetRedirectPath, setRedirectPath } from "@app/redirect-path";
import { homeUrl, loginUrl, logoutUrl, signupUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePaymentRequired, useVerifiedRequired } from "../hooks";
import { Loading } from "../shared";

const denyList = [logoutUrl(), loginUrl(), signupUrl(), homeUrl()];

export const AuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useVerifiedRequired();
  usePaymentRequired();

  useEffect(() => {
    if (loader.isLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (!denyList.includes(location.pathname)) {
        dispatch(setRedirectPath(location.pathname));
      }
      navigate(loginUrl());
    } else {
      dispatch(resetRedirectPath());
    }
  }, [isAuthenticated, loader.isLoading]);

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <Outlet />;
};
