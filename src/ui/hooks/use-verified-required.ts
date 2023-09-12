import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { verifyEmailRequestUrl } from "@app/routes";

import { useCurrentUser } from "./use-current-user";

// ignoreList - in some cases you will NOT want to force verification urls
// allow users to log out if they are presently logged in to come back to this page (ex: can't get into their email)
const ignoreList = ["/logout"];

export const useVerifiedRequired = () => {
  const [user, loader] = useCurrentUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (ignoreList.includes(pathname)) return;
    if (loader.lastSuccess === 0) return;
    if (loader.isLoading) return;
    if (!user.verified) {
      navigate(verifyEmailRequestUrl());
    }
  }, [pathname, user.verified, loader.lastSuccess, loader.isLoading]);
};
