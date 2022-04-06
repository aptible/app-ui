import { useSelector } from 'react-redux';

import { selectIsUserAuthenticated } from '@app/token';
import { selectIsAuthenticationError, selectAuthLoader } from '@app/auth';

import { HelpLink } from '../help-link';
import { LogoutButton } from './logout-button';
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
    <div className="flex justify-center items-center bg-midnight text-white w-full h-full">
      <div style={{ width: 480 }}>
        <div className="w-full mx-auto">
          <div className="flex items-center mb-8">
            <img
              src="/aptible-logo-white-on-dark.svg"
              alt="aptible logo"
              style={{ width: 105 }}
            />
          </div>

          <div>
            <div className="mb-8">
              <div className="text-2xl mb-2">{title}</div>

              {helpText && (
                <div className="flex items-center">
                  <div className="text-xs opacity-50">{helpText}</div>
                  {link && (
                    <HelpLink className="ml-2 text-xs" to={link.to}>
                      {link.text} →
                    </HelpLink>
                  )}
                </div>
              )}
              {progressElement}
            </div>

            {credentialError ? (
              <Banner variant="error" className="mb-6">
                {loader.message}
              </Banner>
            ) : null}

            <div>{children}</div>
          </div>
        </div>
        {isAuthenticated ? <LogoutButton /> : null}
      </div>
    </div>
  );
};
