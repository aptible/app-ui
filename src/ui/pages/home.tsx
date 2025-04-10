import { FETCH_REQUIRED_DATA } from "@app/bootup";
import { selectHasDiagnosticsPocFeature } from "@app/organizations";
import { useSelector } from "@app/react";
import { environmentsUrl, softwareCatalogUrl } from "@app/routes";
import { schema } from "@app/schema";
import { Navigate } from "react-router";
import { Loading } from "../shared";

export const HomePage = () => {
  const loader = useSelector((s) =>
    schema.loaders.selectById(s, { id: FETCH_REQUIRED_DATA }),
  );
  const hasDiagnosticsPoc = useSelector(selectHasDiagnosticsPocFeature);

  // Wait for required data to be loaded before redirecting
  if (loader.status !== "success") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading text="Loading" />
      </div>
    );
  }

  return (
    <Navigate
      to={hasDiagnosticsPoc ? softwareCatalogUrl() : environmentsUrl()}
      replace
    />
  );
};
