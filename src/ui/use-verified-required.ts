import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { verifyEmailRequestUrl } from '@app/routes';
import { selectJWTToken } from '@app/token';

export const useVerifiedRequired = () => {
  const navigate = useNavigate();
  const user = useSelector(selectJWTToken);

  useEffect(() => {
    if (!user.verified) {
      navigate(verifyEmailRequestUrl());
    }
  }, [user.verified]);
};
