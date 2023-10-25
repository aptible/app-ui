import { useParams } from "react-router";
import { DetailPageSections, EnvironmentList } from "../shared";

export const StackDetailEnvironmentsPage = () => {
  const { id = "" } = useParams();
  return (
    <div className="mb-4">
      <DetailPageSections>
        <EnvironmentList stackId={id} showTitle={false} />
      </DetailPageSections>
    </div>
  );
};
