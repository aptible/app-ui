import { selectAppById } from "@app/deploy";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppServicesOverview, DetailPageSections } from "../shared";

export function AppDetailServicesPage() {
  const { id = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  return (
    <DetailPageSections>
      <AppServicesOverview appId={app.id} />
    </DetailPageSections>
  );
}
