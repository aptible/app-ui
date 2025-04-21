import { fetchDashboards } from "@app/deploy/dashboard";
import { selectDashboardsForTableSearch } from "@app/deploy/search";
import { useQuery, useSelector } from "@app/react";
import { diagnosticsCreateUrl, diagnosticsDetailUrl } from "@app/routes";
import { Link, useSearchParams } from "react-router-dom";
import { usePaginate } from "../hooks/use-paginate";
import { AppSidebarLayout } from "../layouts";
import {
  ActionBar,
  Banner,
  ButtonLink,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  IconPlusCircle,
  InputSearch,
  PaginateBar,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";
export const DiagnosticsPage = () => {
  useQuery(fetchDashboards());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const dashboards = useSelector((s) =>
    selectDashboardsForTableSearch(s, { search }),
  );
  const paginated = usePaginate(dashboards);

  return (
    <AppSidebarLayout>
      <Banner className="mt-2">
        <strong>New Feature:</strong> Use Aptible AI to diagnose production
        issues related to increased errors, latency or availability.
      </Banner>
      <TitleBar description="Generate a dashboard displaying logs, metrics, and recent changes for any app.">
        Diagnostics
      </TitleBar>

      <FilterBar>
        <div className="flex justify-between">
          <Group variant="horizontal" size="sm" className="items-center">
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />
          </Group>

          <ActionBar>
            <ButtonLink to={diagnosticsCreateUrl()}>
              <IconPlusCircle variant="sm" className="mr-2" /> Diagnose Issues
            </ButtonLink>
          </ActionBar>
        </div>

        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>{paginated.totalItems} Diagnostics</DescBar>
          <PaginateBar {...paginated} />
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Dashboard</Th>
          <Th>Time Created</Th>
          <Th>Time Range</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={6} /> : null}
          {paginated.data.map((dashboard) => (
            <Tr key={dashboard.id}>
              <Td className="flex-1">
                <Link to={diagnosticsDetailUrl(dashboard.id)} className="flex">
                  <img
                    src="/resource-types/logo-diagnostics.png"
                    className="w-[32px] h-[32px] mr-2 align-middle"
                    aria-label="App"
                  />
                  <p className={`${tokens.type["table link"]} leading-8`}>
                    {dashboard.name}
                  </p>
                </Link>
              </Td>
              <Td className="flex-1">
                <p>{new Date(dashboard.createdAt).toLocaleString()}</p>
              </Td>
              <Td className="flex-1">
                <p>
                  {new Date(dashboard.rangeBegin).toLocaleString()} -{" "}
                  {new Date(dashboard.rangeEnd).toLocaleString()}
                </p>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </AppSidebarLayout>
  );
};
