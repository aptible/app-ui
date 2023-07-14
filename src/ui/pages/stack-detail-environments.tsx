import { DetailPageSections, EnvironmentListByStack } from "../shared";
import { useParams } from "react-router";

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
