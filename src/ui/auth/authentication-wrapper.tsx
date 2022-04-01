import { useSelector } from 'react-redux';

import { selectAuthLoader } from '@app/loaders';
import {
  selectIsAuthenticationError,
  selectIsUserAuthenticated,
} from '@app/token';

import { PageTitle } from '../page-title';
import { HelpLink } from '../help-link';
import { LogoutButton } from './logout-button';
import { HomeLink } from './home-link';
import { Banner } from '../banner';

interface Props {
  title: string;
  progressElement?: React.ReactNode;
  helpText?: string;
  link?: {
    text: string;
    to: string;
  };
  children: React.ReactNode;
}

export const AuthenticationWrapper = ({
  children,
  title,
  progressElement,
  helpText,
  link,
}: Props) => {
  const credentialError = useSelector(selectIsAuthenticationError);
  const loader = useSelector(selectAuthLoader);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);

  return (
    <>
      <PageTitle title={title} />
      <div>
        <div className="body-container bg-gray-900 w-full min-h-screen pb-8">
          <div className="login-box w-full mx-auto">
            <div className="flex login-box__header items-center">logo</div>

            {credentialError ? (
              <Banner variant="error" className="mb-6">
                {loader.message}
              </Banner>
            ) : null}

            <div className="brand-dark-panel">
              <div className="brand-dark-form__header">
                <h3 className="brand-dark-form__title">{title}</h3>

                {helpText && (
                  <div className="brand-dark-form__help-links">
                    {helpText}
                    {link && (
                      <HelpLink className="ml-2" to={link.to}>
                        {link.text} →
                      </HelpLink>
                    )}
                  </div>
                )}
                {progressElement}
              </div>
              <div className="brand-dark-form__body">{children}</div>
            </div>
            <HomeLink />
          </div>
          {isAuthenticated ? <LogoutButton /> : null}
        </div>
      </div>
    </>
  );
};
