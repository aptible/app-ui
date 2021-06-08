import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { verifyEmailRequestUrl } from '@app/routes';
import { selectCurrentUser } from '@app/users';

export const useVerifiedRequired = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!user.verified) {
      navigate(verifyEmailRequestUrl());
    }
  }, [user.verified]);
};
