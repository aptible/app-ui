import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

import { selectEnv } from "@app/env";
import { verifyEmailRequestUrl } from "@app/routes";
import { selectJWTToken } from "@app/token";

export const useVerifiedRequired = () => {
  const config = useSelector(selectEnv);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { verified } = useSelector(selectJWTToken);

  useEffect(() => {
    // allow users to log out if they are presently logged in to come back to this page
    // only allow this for nextgen app
    if (
      !verified &&
      !["/logout"].includes(pathname) &&
      config.origin === "nextgen"
    ) {
      navigate(verifyEmailRequestUrl());
    }
  }, [config.origin, pathname, verified]);
};
