import { logout } from "@app/auth";
import { selectLegacyDashboardUrl } from "@app/config";
import { useDispatch, useSelector } from "@app/react";
import { loginUrl } from "@app/routes";
import { useNavigate } from "react-router";
import { HeroBgLayout } from "../layouts";
import { Box, Button, IconArrowRight, tokens } from "../shared";

export const LogoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const legacyUrl = useSelector(selectLegacyDashboardUrl);

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
          Click to log out to continue or visit{" "}
          <a href={`${legacyUrl}/settings/protected/admin`}>
            Security Settings
          </a>{" "}
          to log out of all active sessions.
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
