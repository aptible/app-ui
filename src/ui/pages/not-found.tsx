import { loginUrl } from "@app/routes";

import { HeroBgLayout } from "../layouts";
import { Box, Button, ButtonLink, tokens } from "../shared";

export const NotFoundPage = () => {
  const goToDocs = (event: React.SyntheticEvent) => {
    event.preventDefault();
    window.location.href = "https://www.aptible.com/docs";
  };

  const goToStatus = (event: React.SyntheticEvent) => {
    event.preventDefault();
    window.location.href = "https://status.aptible.com/";
  };

  return (
    <HeroBgLayout>
      <div className="text-center mt-16">
        <h1 className={`${tokens.type.h1} text-center`}>Page Not Found</h1>
        <p className="my-6 text-gray-600">
          We can't find the page you're looking for.
          <br />
          Maybe you mistyped the address? If not, the page may have moved.
        </p>
      </div>
      <Box>
        <ButtonLink to={loginUrl()}>Back to Login</ButtonLink>
        <Button className="mt-4 w-full" onClick={goToDocs} variant="white">
          View Docs
        </Button>
        <Button className="mt-4 w-full" onClick={goToStatus} variant="white">
          View Status Page
        </Button>
      </Box>
    </HeroBgLayout>
  );
};
