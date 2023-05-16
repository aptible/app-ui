import { HeroBgLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Input,
  tokens,
} from "../shared";
import { forgotPass, resetPass } from "@app/auth/pass";
import { loginUrl } from "@app/routes";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { useLoader } from "saga-query/react";

export const ForgotPassPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const loader = useLoader(forgotPass);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    dispatch(forgotPass({ email }));
  };

  return (
    <HeroBgLayout>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Reset your password</h1>
        <p className="mt-6 text-gray-600">
          Provide the email address associated with your account and we will
          send you a reset password email.
        </p>
        <p className="mt-2 mb-6 text-gray-600">
          Or if you remember your password, you can go back to{" "}
          <Link to={loginUrl()}>login</Link>.
        </p>
      </div>
      <Box>
        <form onSubmit={onSubmit}>
          <FormGroup label="Email" htmlFor="email">
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="Enter your email"
              className="w-full"
            />
          </FormGroup>
          <Button
            className="w-full mt-4"
            disabled={email === "" || loader.isSuccess}
            isLoading={loader.isLoading}
          >
            Reset password
          </Button>

          <BannerMessages className="my-2" {...loader} />
        </form>
      </Box>
    </HeroBgLayout>
  );
};

export const ForgotPassVerifyPage = () => {
  const { challengeId = "", verificationCode = "" } = useParams();
  const dispatch = useDispatch();
  const [pass, setPass] = useState("");
  const loader = useLoader(resetPass);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pass || !challengeId || !verificationCode) return;
    dispatch(resetPass({ password: pass, challengeId, verificationCode }));
  };

  return (
    <HeroBgLayout>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Reset your password</h1>
        <p className="mt-6 text-gray-600">Finish changing your password.</p>
      </div>
      <Box>
        <form onSubmit={onSubmit}>
          <FormGroup label="New Password" htmlFor="pass">
            <Input
              type="password"
              id="pass"
              name="pass"
              value={pass}
              onChange={(e) => setPass(e.currentTarget.value)}
              placeholder="Enter your new password"
              className="w-full"
            />
          </FormGroup>
          <Button
            className="w-full mt-4"
            disabled={pass === "" || loader.isSuccess}
            isLoading={loader.isLoading}
          >
            Change password
          </Button>

          {loader.isError ? (
            <BannerMessages className="my-2" {...loader} />
          ) : null}
          {loader.isSuccess ? (
            <Banner className="my-2" variant="success">
              Success! Continue to <Link to={loginUrl()}>login</Link>
            </Banner>
          ) : null}
        </form>
      </Box>
    </HeroBgLayout>
  );
};
