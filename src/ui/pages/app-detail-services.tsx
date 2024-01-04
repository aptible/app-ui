import { selectAppById } from "@app/deploy";
import { useSelector } from "@app/react";
import { useParams } from "react-router-dom";
import { AppServicesByApp, DetailPageSections } from "../shared";

export function AppDetailServicesPage() {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));

  return (
    <DetailPageSections>
      <AppServicesByApp appId={app.id} />
    </DetailPageSections>
  );
}
