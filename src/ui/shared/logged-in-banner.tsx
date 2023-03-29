import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { Banner } from "../shared";
import { homeUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

export const LoggedInBanner = () => {
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  return isAuthenticated ? (
    <Banner variant="warning" className="mb-6">
      You are already logged in.{" "}
      <Link to={homeUrl()}>Click here to go to the dashboard.</Link>
    </Banner>
  ) : null;
};
