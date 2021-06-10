import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QRCode from 'qrcode.react';
import {
  Flex,
  Box,
  Text,
  FormGroup,
  STATUS_VARIANT,
  Label,
  Input,
  InputFeedback,
  Button,
  Loading,
} from '@aptible/arrow-ds';

import { selectLoader } from '@app/loaders';
import { setupOtp, selectOtp } from '@app/mfa';
import { updateUser, selectCurrentUser } from '@app/users';

import { ExternalLink } from '../external-link';
import { BannerMessages } from '../banner-messages';

export const OtpSetupPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const otpLoader = useSelector(selectLoader(`${setupOtp}`));
  const userLoader = useSelector(selectLoader(`${updateUser}`));
  const otp = useSelector(selectOtp);
  const [error, setError] = useState('');
  const [mfa, setMFA] = useState('');
  const [secret, setSecret] = useState('');

  useEffect(() => {
    if (!otp.uri) return;
    const search = new URLSearchParams(otp.uri.replace(/.*\?/, '?'));
    setSecret(search.get('secret') || '');
  }, [otp.uri]);

  useEffect(() => {
    if (!user.id) return;
    dispatch(setupOtp({ userId: user.id }));
  }, [user.id]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user.id) return;
    if (!otp.id) return;
    if (!mfa) {
      setError('must enter token');
      return;
    }

    dispatch(
      updateUser({
        type: 'otp',
        userId: user.id,
        otp_enabled: true,
        otp_configuration: otp.currentUrl,
        otp_token: mfa,
      }),
    );
  };

  return (
    <Flex className="p-16 justify-center">
      <Box className="max-w-md">
        <Text className="mb-2">
          2-factor authentication will be enabled for your account after
          confirmation.
        </Text>
        <Text>
          To proceed, scan the QR code below with your 2FA app (we recommend
          using{' '}
          <ExternalLink href="https://support.google.com/accounts/answer/1066447?hl=en">
            Google Authenticator
          </ExternalLink>
          ), input the code generated, and click on Enable 2FA.
        </Text>

        {otpLoader.isLoading ? (
          <Loading />
        ) : (
          <Box>
            <Box className="my-4">
              <Flex className="my-4 justify-center align-center">
                <QRCode value={otp.uri} />
              </Flex>
              <Box>Your 2FA URL: {otp.uri}</Box>
              <Box>Your 2FA Secret: {secret}</Box>
            </Box>
            <form onSubmit={onSubmit}>
              <FormGroup
                variant={error ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT}
              >
                <Label htmlFor="input-mfa">2FA Token</Label>

                <Input
                  name="mfa"
                  type="mfa"
                  value={mfa}
                  onChange={(e) => setMFA(e.currentTarget.value)}
                  autoFocus
                  data-testid="input-mfa"
                />
                <InputFeedback data-testid="input-mfa-error">
                  {error}
                </InputFeedback>
              </FormGroup>
              <Button
                type="submit"
                disabled={!!error || !mfa}
                isLoading={userLoader.isLoading}
              >
                Enable 2FA
              </Button>
              <Box className="mt-4">
                <BannerMessages {...userLoader} />
                {otpLoader.isError ? <BannerMessages {...otpLoader} /> : null}
              </Box>
            </form>
          </Box>
        )}
      </Box>
    </Flex>
  );
};
