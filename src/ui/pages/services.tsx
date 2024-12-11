import { fetchServices, selectServicesForTableSearch } from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import type { DeployServiceRow } from "@app/types";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePaginate } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  AppServicesByOrg,
  DescBar,
  FilterBar,
  Group,
  InputSearch,
  LoadingBar,
  PaginateBar,
  TitleBar,
} from "../shared";

export function ServicesPage() {
  const { isLoading } = useQuery(fetchServices());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const [sortBy, setSortBy] = useState<keyof DeployServiceRow>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const services = useSelector((s) =>
    selectServicesForTableSearch(s, { search, sortBy, sortDir }),
  );
  const paginated = usePaginate(services);

  return (
    <AppSidebarLayout>
      <Group>
        <Group size="sm">
          <TitleBar description="Services determine the number of containers of your app and the memory and CPU limits for your app.">
            Services
          </TitleBar>

          <FilterBar>
            <Group variant="horizontal" size="sm" className="items-center">
              <InputSearch
                placeholder="Search..."
                search={search}
                onChange={onChange}
              />
              <LoadingBar isLoading={isLoading} />
            </Group>

            <Group variant="horizontal" size="lg" className="items-center mt-1">
              <DescBar>{paginated.totalItems} Services</DescBar>
              <PaginateBar {...paginated} />
            </Group>
          </FilterBar>
        </Group>

        <AppServicesByOrg
          paginated={paginated}
          onSort={(key) => {
            if (key === sortBy) {
              setSortDir(sortDir === "asc" ? "desc" : "asc");
            } else {
              setSortBy(key);
              setSortDir("desc");
            }
          }}
        />
      </Group>
    </AppSidebarLayout>
  );
}
