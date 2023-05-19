import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import { logout } from "@app/auth";
import { loginUrl } from "@app/routes";

import { HeroBgLayout } from "../layouts";
import { Box, Button, IconArrowRight, tokens } from "../shared";

export const BillingMethodPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    dispatch(logout());
    navigate(loginUrl());
  };

  return (
    <HeroBgLayout>
      <div className="text-center mt-16">
        <h1 className={tokens.type.h1}>Add Credit Card</h1>
        <p className="my-6 text-gray-600">
          Aptible will attempt a $1 pre-authorization charge. <br />
          We will not process this charge. There are no upfront charges.
        </p>
      </div>
      <Box>
        <Button onClick={logoutSubmit} className="font-semibold w-full">
          Log Out
          <IconArrowRight className="ml-2" />
        </Button>
      </Box>
    </HeroBgLayout>
  );
};
