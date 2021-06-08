import React from 'react';
import { Link as RLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Banner, Link, STATUS_VARIANT } from '@aptible/arrow-ds';

import { homeUrl } from '@app/routes';
import { selectIsUserAuthenticated } from '@app/token';

export const LoggedInBanner = () => {
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  return isAuthenticated ? (
    <Banner variant={STATUS_VARIANT.WARNING} withIcon className="mb-6">
      You are already logged in.{' '}
      <Link as={RLink} to={homeUrl()}>
        Click here to go to the dashboard.
      </Link>
    </Banner>
  ) : null;
};
