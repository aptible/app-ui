import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLoader } from 'saga-query/react';
import type { LoadingState } from 'saga-query';

import { User } from '@app/types';
import { selectCurrentUser, selectCurrentUserId, fetchUser } from '@app/users';

type CurrentUser = LoadingState & { user: User };

export function useCurrentUser(): CurrentUser {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const user = useSelector(selectCurrentUser);
  const loader = useLoader(fetchUser);

  useEffect(() => {
    if (!userId || user.id) return;
    dispatch(fetchUser({ userId }));
  }, [userId]);

  return { ...loader, user };
}
