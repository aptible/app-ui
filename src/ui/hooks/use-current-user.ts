import { useLoader } from "@app/fx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { LoadingState } from "saga-query";

import { User } from "@app/types";
import { fetchUser, selectCurrentUser, selectCurrentUserId } from "@app/users";

type CurrentUser = LoadingState & { user: User };

export function useCurrentUser(): CurrentUser {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const user = useSelector(selectCurrentUser);
  const loader = useLoader(fetchUser);

  useEffect(() => {
    if (!userId || user.id) {
      return;
    }
    dispatch(fetchUser({ userId }));
  }, [userId]);

  return { ...loader, user };
}
