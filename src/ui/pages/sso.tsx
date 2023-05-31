import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";

import { selectEnv } from "@app/env";
import { loginUrl, ssoFailureUrl } from "@app/routes";

import { HeroBgLayout } from "../layouts";
import {
  Box,
  Button,
  ButtonLink,
  FormGroup,
  Input,
  Loading,
  tokens,
} from "../shared";

export const SsoLoginPage = () => {
  return (
    <HeroBgLayout>
      <div className="text-center mt-16">
        <h1 className={`${tokens.type.h1} text-center`}>Single Sign On</h1>
        <p className="my-6 text-gray-600">
          Use your organization's single sign-on provider to authenticate with
          Aptible.
        </p>
      </div>
      <Box>
        <form>
          <FormGroup label="Organization ID / Name" htmlFor="org">
            <Input type="text" name="org" id="org" />
          </FormGroup>

          <Button type="submit">Log In</Button>
        </form>
      </Box>
    </HeroBgLayout>
  );
};

export const SsoDirectPage = () => {
  const { orgId = "" } = useParams();
  const env = useSelector(selectEnv);

  useEffect(() => {
    if (orgId === "") return;
    const redirect = encodeURIComponent(`${env.appUrl}${ssoFailureUrl()}`);
    const url = `${env.authUrl}/organizations/${orgId}/saml/login?redirect_uri=${redirect}`;
    window.location.href = url;
  }, [orgId]);

  return <Loading />;
};

export const SsoFailurePage = () => {
  const [params] = useSearchParams();
  const status = params.get("status");
  const error = params.get("error");
  const message = params.get("message");

  return (
    <HeroBgLayout>
      <div className="text-center mt-16">
        <h1 className={`${tokens.type.h1} text-center`}>
          We could not process your Single Sign-On (SSO) login
        </h1>
        <p className="my-6 text-gray-600">
          {status} {error} {message}
        </p>
      </div>
      <Box>
        <ButtonLink to={loginUrl()} className="font-semibold w-full">
          Back to Login
        </ButtonLink>

        <ul className="list-disc list-inside mt-4">
          <li>
            <b>Not an Enterprise customer?</b> Contact support via the link
            below to learn more about upgrading your account to support SSO
          </li>
          <li>
            <b>No SSO provider setup for Aptible Deploy?</b> Contact your
            company's Account Owner to complete the process
          </li>
          <li>
            <b>Forgot or unsure of your organization ID?</b> Contact your
            company's Deploy Admin
          </li>
          <li>
            <b>Never setup an account?</b> Contact your Deploy Admin for an
            account invitation and create your account to enable SSO
          </li>
        </ul>
      </Box>
    </HeroBgLayout>
  );
};
