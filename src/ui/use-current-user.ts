import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingState } from 'robodux';

import { User } from '@app/types';
import { selectCurrentUser, selectCurrentUserId, fetchUser } from '@app/users';
import { selectLoader } from '@app/loaders';

type CurrentUser = LoadingState & { user: User };

export function useCurrentUser() {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const user = useSelector(selectCurrentUser);
  const loader = useSelector(selectLoader(`${fetchUser}`));

  useEffect(() => {
    if (!userId || user.id) return;
    dispatch(fetchUser({ userId }));
  }, [userId]);

  return { ...loader, user };
}
