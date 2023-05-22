import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { useLoader } from "saga-query/react";

import { fetchCurrentToken } from "@app/auth";
import { homeUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

import { Loading } from "../shared";
import { useEffect } from "react";

export const UnauthRequired = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (loader.isLoading) {
      return;
    }
    if (isAuthenticated) {
      navigate(homeUrl(), { replace: true });
    }
  }, [isAuthenticated, loader]);

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
