import { useParams } from "react-router";
import { DetailPageSections, EnvironmentListByStack } from "../shared";

export const StackDetailEnvironmentsPage = () => {
  const { id = "" } = useParams();
  return (
    <div className="mb-4">
      <DetailPageSections>
        <EnvironmentListByStack stackId={id} />
      </DetailPageSections>
    </div>
  );
};
