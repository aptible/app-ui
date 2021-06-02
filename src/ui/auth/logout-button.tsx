import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Text, Link } from '@app/system';
import { selectCurrentUser } from '@app/users';
import { logout } from '@app/auth';

export const LogoutButton = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const onLogout = () => dispatch(logout());
  return (
    <Box className="bg-gray-900 text-center w-full pt-5">
      <Box className="login-box w-full mx-auto">
        <Text className="brand-dark-form__help-links mb-5">
          Currently logged in as {user.email}.{' '}
          <Link
            as="button"
            onClick={onLogout}
            className="brand-dark-form__link"
            noStyles
          >
            Logout
          </Link>
        </Text>
      </Box>
    </Box>
  );
};
