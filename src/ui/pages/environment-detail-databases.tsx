import { useParams } from "react-router";
import { DatabaseListByEnvironment, DetailPageSections } from "../shared";

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
        <DatabaseListByEnvironment environmentId={id} />
      </DetailPageSections>
    </div>
  );
};
