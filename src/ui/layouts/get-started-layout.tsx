import { useSelector } from "@app/react";
import { selectIsUserAuthenticated } from "@app/token";
import { Box, DeployAppFooter, Group, tokens } from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";
import { HeroBgLayout } from "./hero-bg-layout";

export const GetStartedLayout = ({
  children,
}: { children: React.ReactNode }) => {
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated);
  const Wrapper = isUserAuthenticated ? AppSidebarLayout : HeroBgLayout;

  return (
    <Wrapper>
      <div className="flex flex-col items-center">
        <div className="max-w-[600px]">
          <div className="text-center mt-10">
            <h1 className={tokens.type.h1}>Deploy your App</h1>
            <p className="my-6 text-gray-600 w-full mx-auto">
              Control your AWS resources, guarantee uptime, and achieve
              enterprise best practices without building your own internal
              developer platform.
            </p>
          </div>

          <Box className="w-full mx-auto">
            <Group>{children}</Group>
          </Box>

          <div className="mt-6 w-full mx-auto">
            <DeployAppFooter />
          </div>
        </div>
      </div>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </Wrapper>
  );
};
