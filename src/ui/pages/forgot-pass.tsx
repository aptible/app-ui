import { HeroBgLayout } from "../layouts";
import { Box, Button, FormGroup, Input, tokens } from "../shared";
import { loginUrl } from "@app/routes";
import { useState } from "react";
import { Link } from "react-router-dom";

export const ForgotPassPage = () => {
  const [email, setEmail] = useState("");
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          <Button className="w-full mt-4" disabled={email === ""}>
            Reset password
          </Button>
        </form>
      </Box>
    </HeroBgLayout>
  );
};
