import { AppListByEnvironment, DetailPageSections } from "../shared";
import { useParams } from "react-router";

export const EnvironmentAppsPage = () => {
  const { id = "" } = useParams();

  return (
    <div className="mb-4">
      <DetailPageSections>
        {/* <div className="flex">
          <div className="flex w-1/2">
            <ButtonIcon icon={<IconPlusCircle />}>New App</ButtonIcon>
          </div>
        </div> */}
        <AppListByEnvironment
          environmentId={id}
          skipDescription
          resourceHeaderType="hidden"
        />
      </DetailPageSections>
    </div>
  );
};
