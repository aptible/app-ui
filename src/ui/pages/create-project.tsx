import { createProjectGitUrl } from "@app/routes";
import { ListingPageLayout } from "../layouts";
import { ButtonLink, IconSmallArrowRight, tokens, Box } from "../shared";

export const CreateProjectPage = () => {
  return (
    <ListingPageLayout>
      <div className="flex justify-center container">
        <div style={{ width: 500 }}>
          <div className="text-center">
            <h1 className={tokens.type.h1}>Create an Environment</h1>
            <p className="my-4 text-gray-600">
              Choose a deployment type for your app to get started.
            </p>
          </div>
          <Box>
            <ButtonLink to={createProjectGitUrl()} className="font-bold">
              Deploy your code
              <IconSmallArrowRight className="ml-2" />
            </ButtonLink>
          </Box>
        </div>
      </div>
    </ListingPageLayout>
  );
};
