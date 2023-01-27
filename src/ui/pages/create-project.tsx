import { createProjectGitUrl } from "@app/routes";
import { Link } from "react-router-dom";
import { ListingPageLayout } from "../layouts";

export const CreateProjectPage = () => {
  return (
    <ListingPageLayout>
      <h1>Create Project page!</h1>
      <Link to={createProjectGitUrl()}>From git</Link>
    </ListingPageLayout>
  );
};
