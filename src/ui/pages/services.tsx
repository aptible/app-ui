import { fetchServices, selectServicesByOrgId } from "@app/deploy";
import { useSearchParams } from "react-router-dom";
import { useQuery, useSelector } from "starfx/react";
import { usePaginate } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  DescBar,
  FilterBar,
  Group,
  InputSearch,
  LoadingBar,
  PaginateBar,
  ServiceByOrgTable,
  TitleBar,
} from "../shared";

export function ServicesPage() {
  const { isLoading } = useQuery(fetchServices());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const services = useSelector(selectServicesByOrgId);
  const paginated = usePaginate(services);

  return (
    <AppSidebarLayout>
      <Group>
        <Group size="sm">
          <TitleBar description="Services">Services</TitleBar>

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
              <DescBar>{paginated.totalItems} Apps</DescBar>
              <PaginateBar {...paginated} />
            </Group>
          </FilterBar>
        </Group>

        <ServiceByOrgTable paginated={paginated} />
      </Group>
    </AppSidebarLayout>
  );
}
