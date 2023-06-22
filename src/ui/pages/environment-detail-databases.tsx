import { DatabaseListByEnvironment, DetailPageSections } from "../shared";
import { useParams } from "react-router";

export const EnvironmentDatabasesPage = () => {
  const { id = "" } = useParams();

  return (
    <div className="mb-4">
      <DetailPageSections>
        {/* <div className="flex mt-4">
          <div className="flex w-1/2">
            <ButtonIcon icon={<IconPlusCircle />}>New Database</ButtonIcon>
          </div>
        </div> */}
        <DatabaseListByEnvironment
          environmentId={id}
          skipDescription
          resourceHeaderType="hidden"
        />
      </DetailPageSections>
    </div>
  );
};
