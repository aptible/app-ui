import type { LoadingState } from "@app/fx";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { useEffect, useMemo } from "react";

import { User } from "@app/types";
import { fetchUser, selectCurrentUser, selectCurrentUserId } from "@app/users";

export function useCurrentUser(): [User, LoadingState] {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const user = useSelector(selectCurrentUser);
  const loader = useLoader(fetchUser);

  useEffect(() => {
    if (user.id !== "") {
      return;
    }
    dispatch(fetchUser({ userId }));
  }, [userId]);

  const mem: [User, LoadingState] = useMemo(() => {
    return [user, loader];
  }, [user, loader.status]);

  return mem;
}
