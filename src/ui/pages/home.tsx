import { selectHasDiagnosticsPocFeature } from "@app/organizations";
import { useSelector } from "@app/react";
import { diagnosticsUrl, environmentsUrl } from "@app/routes";
import { Navigate } from "react-router";

export const HomePage = () => {
  const hasDiagnosticsPoc = useSelector(selectHasDiagnosticsPocFeature);
  return (
    <Navigate
      to={hasDiagnosticsPoc ? diagnosticsUrl() : environmentsUrl()}
      replace
    />
  );
};
