import {
  AppListByEnvironment,
  DatabaseListByEnvironment,
  DetailPageSections,
  InputSearch,
} from "../shared";
import { useState } from "react";
import { useParams } from "react-router";

export const EnvironmentResourcesPage = () => {
  const { id = "" } = useParams();
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <div className="mb-4">
      <DetailPageSections>
        <div className="flex mt-4">
          <div className="flex w-1/2">
            {/* <ButtonIcon icon={<IconPlusCircle />}>New App</ButtonIcon>
            <div className="ml-4">
              <ButtonIcon icon={<IconPlusCircle />}>New Database</ButtonIcon>
            </div> */}
          </div>
          <div className="flex w-1/2 justify-end">
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />
          </div>
        </div>
        <AppListByEnvironment
          environmentId={id}
          skipDescription
          resourceHeaderType="simple-text"
          search={search}
          onChange={onChange}
        />
        <DatabaseListByEnvironment
          environmentId={id}
          skipDescription
          resourceHeaderType="simple-text"
          search={search}
          onChange={onChange}
        />
      </DetailPageSections>
    </div>
  );
};
