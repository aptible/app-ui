import { AppListByEnvironment, DetailPageSections } from "../shared";
import { useParams } from "react-router";

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
