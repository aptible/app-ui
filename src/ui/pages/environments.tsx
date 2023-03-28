import { ListingPageLayout } from "../layouts";
import { useState } from "react";

import {
  ButtonIcon,
  EnvironmentActivity,
  EnvironmentList,
  IconPlusCircle,
  InputSearch,
  ResourceHeader,
} from "../shared";

export const EnvironmentsPage = () => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <ListingPageLayout>
      <div>
        <ResourceHeader
          title="Environments"
          description="Environments are containers for your apps and databases."
          actions={[
            <div className="pl-2">
              <ButtonIcon
                className="w-full cursor-not-allowed pointer-events-none opacity-50"
                icon={<IconPlusCircle />}
              >
                New Environment
              </ButtonIcon>
            </div>,
          ]}
          filterBar={
            <InputSearch
              placeholder="Search environments ..."
              search={search}
              onChange={onChange}
            />
          }
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3 grid-cols-1">
        <div className="lg:col-span-2 col-span-1">
          <EnvironmentList search={search} />
        </div>
        <div className="col-span-1">
          <EnvironmentActivity />
        </div>
      </div>
    </ListingPageLayout>
  );
};
