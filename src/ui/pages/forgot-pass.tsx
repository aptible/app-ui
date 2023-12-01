import { forgotPass, resetPass } from "@app/auth/pass";
import { useDispatch, useLoader } from "@app/react";
import { loginUrl } from "@app/routes";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HeroBgLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Group,
  Input,
  tokens,
} from "../shared";

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
      <div className="text-center mb-4">
        <h1 className={`${tokens.type.h1} text-center`}>Reset your password</h1>
        <p className="mt-6 text-gray-600 mb-4">
          Check your email for reset instructions or go back to{" "}
          <Link to={loginUrl()}>Log In</Link>.
        </p>
      </div>

      <Box>
        <Group>
          <BannerMessages {...loader} />

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
              className="w-full mt-6"
              disabled={email === "" || loader.isSuccess}
              isLoading={loader.isLoading}
              type="submit"
            >
              Reset Password
            </Button>
          </form>
        </Group>
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
        <h1 className={tokens.type.h1}>Reset Password</h1>
        <p className="mt-6 text-gray-600">Finish changing your password.</p>
      </div>

      <Box>
        <Group>
          {loader.isError ? (
            <BannerMessages className="my-2" {...loader} />
          ) : null}
          {loader.isSuccess ? (
            <Banner className="my-2" variant="success">
              Success! Continue to <Link to={loginUrl()}>login</Link>
            </Banner>
          ) : null}

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
              type="submit"
            >
              Change password
            </Button>
          </form>
        </Group>
      </Box>
    </HeroBgLayout>
  );
};
