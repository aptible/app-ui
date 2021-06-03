import React from 'react';
import { useSelector } from 'react-redux';
import {
  ThemeContext,
  THEME,
  Flex,
  Box,
  Text,
  STATUS_VARIANT,
  Banner,
  Frame,
  AptibleLogo,
} from '@aptible/arrow-ds';

import { selectAuthLoader } from '@app/loaders';
import {
  selectIsAuthenticationError,
  selectIsUserAuthenticated,
} from '@app/token';

import { PageTitle } from '../page-title';
import { HelpLink } from '../help-link';
import { LogoutButton } from './logout-button';
import { HomeLink } from './home-link';

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
      <Frame.Area name="main">
        <Box className="body-container bg-gray-900 w-full min-h-screen pb-8">
          <Box className="login-box w-full mx-auto">
            <Flex className="login-box__header items-center">
              <AptibleLogo height={34} />
            </Flex>

            {credentialError && (
              <Banner variant={STATUS_VARIANT.DANGER} withIcon className="mb-6">
                {loader.message.message}
              </Banner>
            )}

            <Box className="brand-dark-panel">
              <Box className="brand-dark-form__header">
                <h3 className="brand-dark-form__title">{title}</h3>

                {helpText && (
                  <Text className="brand-dark-form__help-links">
                    {helpText}
                    {link && (
                      <HelpLink className="ml-2" to={link.to}>
                        {link.text} →
                      </HelpLink>
                    )}
                  </Text>
                )}
                {progressElement}
              </Box>
              <Box className="brand-dark-form__body">
                <ThemeContext.Provider value={THEME.BRAND}>
                  {children}
                </ThemeContext.Provider>
              </Box>
            </Box>
            <HomeLink />
          </Box>
          {isAuthenticated ? <LogoutButton /> : null}
        </Box>
      </Frame.Area>
    </>
  );
};
