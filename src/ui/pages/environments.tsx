import { ListingPageLayout } from "../layouts";
import { useState } from "react";

import { EnvironmentList, InputSearch, ResourceHeader } from "../shared";

export const EnvironmentsPage = () => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <ListingPageLayout>
      <div>
        <ResourceHeader
          title="Environments"
          filterBar={
            <InputSearch
              placeholder="Search environments ..."
              search={search}
              onChange={onChange}
            />
          }
        />
      </div>
      <EnvironmentList search={search} />
    </ListingPageLayout>
  );
};
