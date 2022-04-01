import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { homeUrl } from '@app/routes';
import { selectIsUserAuthenticated } from '@app/token';
import { Banner } from '../banner';

export const LoggedInBanner = () => {
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  return isAuthenticated ? (
    <Banner variant="warning" className="mb-6">
      You are already logged in.{' '}
      <Link to={homeUrl()}>Click here to go to the dashboard.</Link>
    </Banner>
  ) : null;
};
