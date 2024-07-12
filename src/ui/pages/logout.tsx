import { logout } from "@app/auth";
import { useDispatch } from "@app/react";
import { loginUrl, securitySettingsUrl } from "@app/routes";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { HeroBgLayout } from "../layouts";
import { Box, Button, IconArrowRight, tokens } from "../shared";

export const LogoutPage = () => {
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
        <h1 className={`${tokens.type.h1} text-center`}>Confirm Log Out</h1>
        <p className="my-6 text-gray-600">
          Click to log out now or visit{" "}
          <Link to={securitySettingsUrl()}>Security Settings</Link> to log out
          of other active sessions, first.
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
