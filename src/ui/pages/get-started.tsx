import { createEnvUrl } from "@app/routes";
import { GetStartedLayout } from "../layouts";
import { ButtonLink, IconArrowRight } from "../shared";

export const GetStartedPage = () => {
  return (
    <GetStartedLayout>
      <ButtonLink to={createEnvUrl()} className="font-bold">
        Get Started
        <IconArrowRight variant="sm" className="ml-2" />
      </ButtonLink>
    </GetStartedLayout>
  );
};
