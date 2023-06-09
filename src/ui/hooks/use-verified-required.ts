import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

import { useCurrentUser } from "./use-current-user";
import { verifyEmailRequestUrl } from "@app/routes";
import { selectCurrentUser } from "@app/users";

// ignoreList - in some cases you will NOT want to force verification urls
// allow users to log out if they are presently logged in to come back to this page (ex: can't get into their email)
const ignoreList = ["/logout"];

export const useVerifiedRequired = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { verified } = useSelector(selectCurrentUser);

  useEffect(() => {
    if (ignoreList.includes(pathname)) return;
    if (user.lastSuccess === 0) return;
    if (user.isLoading) return;
    if (!verified) {
      navigate(verifyEmailRequestUrl());
    }
  }, [pathname, verified, user.lastSuccess, user.isLoading]);
};
