import { diagnosticsCreateUrl } from "@app/routes";
import { Link } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  ActionBar,
  Banner,
  ButtonLink,
  DescBar,
  FilterBar,
  Group,
  IconPlusCircle,
  InputSearch,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";
import { useQuery, useSelector } from "@app/react";
import { fetchDashboards, selectDashboardsAsList } from "@app/deploy/dashboard";

export const DiagnosticsPage = () => {
  useQuery(fetchDashboards());
  const dashboards = useSelector(selectDashboardsAsList);

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
              search={""}
              onChange={console.log}
            />
          </Group>

          <ActionBar>
            <ButtonLink to={diagnosticsCreateUrl()}>
              <IconPlusCircle variant="sm" className="mr-2" /> Diagnose Issues
            </ButtonLink>
          </ActionBar>
        </div>

        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>{dashboards.length} Diagnostics</DescBar>
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Dashboard</Th>
          <Th>Time Range</Th>
        </THead>

        <TBody>
          {dashboards.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4">
                No diagnostics found
              </td>
            </tr>
          ) : (
            dashboards.map((dashboard) => (
              <Tr key={dashboard.id}>
                <Td className="flex-1">
                  <Link to="#" className="flex">
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
                  <p>{new Date(dashboard.createdAt).toLocaleString()} UTC</p>
                </Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>
    </AppSidebarLayout>
  );
};
