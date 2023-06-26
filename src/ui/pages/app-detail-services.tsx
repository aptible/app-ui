import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { fetchEnvironmentServices, selectAppById } from "@app/deploy";
import { AppState } from "@app/types";

import { DetailPageSections, LoadResources, ServicesOverview } from "../shared";

export function AppDetailServicesPage() {
  const { id = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: app.environmentId }));

  return (
    <LoadResources query={query} isEmpty={false}>
      <DetailPageSections>
        <ServicesOverview serviceIds={app.serviceIds} />
      </DetailPageSections>
    </LoadResources>
  );
}
