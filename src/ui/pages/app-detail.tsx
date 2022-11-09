import { useParams } from "react-router-dom";
import { useQuery } from "saga-query/react";
import { useSelector } from "react-redux";

import { fetchApp, hasDeployApp, selectAppById } from "@app/deploy";
import { AppState } from "@app/types";

import {
  DetailPageSections,
  ServicesOverview,
  AppEndpointsOverview,
} from "../shared";

export function AppDetailPage() {
  const { id = "" } = useParams();
  const { isInitialLoading, message } = useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  if (hasDeployApp(app)) {
    return (
      <DetailPageSections>
        <ServicesOverview app={app} />
        <AppEndpointsOverview app={app} />
      </DetailPageSections>
    );
  }

  if (isInitialLoading) {
    return <span>Loading...</span>;
  }
  return <span>{message || "Something went wrong"}</span>;
}
