import { useDispatch, useSelector } from 'react-redux';

import { selectJWTToken } from '@app/token';
import { logout } from '@app/auth';
import { Button } from '../button';

export const LogoutButton = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectJWTToken);
  const onLogout = () => dispatch(logout());
  return (
    <div className="bg-gray-900 text-center w-full pt-5">
      <div className="login-box w-full mx-auto">
        <div className="brand-dark-form__help-links mb-5">
          Currently logged in as {user.email}.{' '}
          <Button onClick={onLogout} className="brand-dark-form__link">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
