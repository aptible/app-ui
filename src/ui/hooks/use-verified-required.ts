import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

import { useCurrentUser } from "./use-current-user";
import { selectEnv } from "@app/env";
import { verifyEmailRequestUrl } from "@app/routes";
import { selectCurrentUser } from "@app/users";

export const useVerifiedRequired = () => {
  const user = useCurrentUser();
  const config = useSelector(selectEnv);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { verified } = useSelector(selectCurrentUser);

  useEffect(() => {
    // allow users to log out if they are presently logged in to come back to this page
    // only allow this for nextgen app
    if (
      !user.isLoading &&
      !verified &&
      pathname !== "/logout" &&
      config.origin === "nextgen"
    ) {
      navigate(verifyEmailRequestUrl());
    }
  }, [config.origin, user.isLoading, pathname, verified]);
};
