import { sourceDetailUrl } from "@app/routes";
import { fetchSources, selectSourcesAsList } from "@app/source";
import { Link } from "react-router-dom";
import { useQuery, useSelector } from "starfx/react";
import { usePaginate } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  LoadingBar,
  PaginateBar,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
} from "../shared";

export function SourcesPage() {
  const { isLoading } = useQuery(fetchSources());
  const sources = useSelector(selectSourcesAsList);
  const paginated = usePaginate(sources);

  return (
    <AppSidebarLayout>
      <Group>
        <Group size="sm">
          <TitleBar description="Sources are where your App deployments originate from">
            Sources
          </TitleBar>

          <FilterBar>
            <Group variant="horizontal" size="sm" className="items-center">
              <LoadingBar isLoading={isLoading} />
            </Group>

            <Group variant="horizontal" size="lg" className="items-center mt-1">
              <DescBar>{paginated.totalItems} Sources</DescBar>
              <PaginateBar {...paginated} />
            </Group>
          </FilterBar>
        </Group>

        <Table>
          <THead>
            <Th>Name</Th>
          </THead>

          <TBody>
            {paginated.data.length === 0 ? <EmptyTr colSpan={3} /> : null}
            {paginated.data.map((source) => {
              return (
                <Tr key={source.id}>
                  <Td>
                    <Link
                      to={sourceDetailUrl(source.id)}
                      className="flex items-center"
                    >
                      <img
                        src={"/resource-types/logo-source.png"}
                        className="w-[32px] h-[32px] mr-2 align-middle"
                        aria-label="Git Source"
                      />
                      {source.displayName}
                    </Link>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </Group>
    </AppSidebarLayout>
  );
}
