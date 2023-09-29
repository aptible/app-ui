import { useParams } from "react-router";
import { AppListByEnvironment, DetailPageSections } from "../shared";

export const EnvironmentAppsPage = () => {
  const { id = "" } = useParams();

  return (
    <div className="mb-4">
      <DetailPageSections>
        <AppListByEnvironment environmentId={id} />
      </DetailPageSections>
    </div>
  );
};
