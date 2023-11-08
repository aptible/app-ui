import { useParams } from "react-router";
import { DatabaseListByEnvironment, DetailPageSections } from "../shared";

export const EnvironmentDatabasesPage = () => {
  const { id = "" } = useParams();

  return (
    <div className="mb-4">
      <DetailPageSections>
        <DatabaseListByEnvironment envId={id} />
      </DetailPageSections>
    </div>
  );
};
