import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { logout } from "@app/auth";
import { loginUrl } from "@app/routes";

import { AptibleLogo, Box, Button, IconArrowRight, tokens } from "../shared";
import { selectLegacyDashboardUrl } from "@app/env";

export const LogoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const legacyUrl = useSelector(selectLegacyDashboardUrl);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(logout());
    navigate(loginUrl());
  };

  return (
    <div
      className="flex flex-col flex-1 h-full bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/background-pattern-v2.png)",
      }}
    >
      <div className="min-h-full flex flex-col py-16 sm:px-6 lg:px-8">
        <div className="flex justify-center container py-4">
          <div style={{ width: 500 }}>
            <div className="flex items-center justify-center mb-5">
              <AptibleLogo width={160} />
            </div>
            <div className="text-center mt-16">
              <h1 className={tokens.type.h1}>Confirm Log Out</h1>
              <p className="my-6 text-gray-600">
                Click to log out to continue or visit{" "}
                <a href={`${legacyUrl}/settings/protected/admin`}>
                  Security Settings
                </a>{" "}
                to log out of all active sessions.
              </p>
            </div>
            <Box>
              <form onSubmit={onSubmit}>
                <Button className="font-semibold w-full">
                  Log Out
                  <IconArrowRight className="ml-2" />
                </Button>
              </form>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};
