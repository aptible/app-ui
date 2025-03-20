import { fetchCustomResources } from "@app/deploy/custom-resource";
import { selectCustomResourcesForTableSearch } from "@app/deploy/search";
import { useQuery, useSelector } from "@app/react";
import { customResourceDetailUrl } from "@app/routes";
import { useSearchParams } from "react-router-dom";
import { usePaginate } from "../hooks/use-paginate";
import { AppSidebarLayout } from "../layouts";
import {
  ButtonLink,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  InputSearch,
  PaginateBar,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
} from "../shared";

export const CustomResourcesPage = () => {
  useQuery(fetchCustomResources());

  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };

  const customResources = useSelector((s) =>
    selectCustomResourcesForTableSearch(s, { search }),
  );

  const paginated = usePaginate(customResources);

  return (
    <AppSidebarLayout>
      <TitleBar description="Manage your custom resources.">
        Custom Resources
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
        </div>

        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>{paginated.totalItems} Custom Resources</DescBar>
          <PaginateBar {...paginated} />
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Handle</Th>
          <Th>Resource Type</Th>
          <Th>Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={3} /> : null}
          {paginated.data.map((resource) => (
            <Tr key={resource.id}>
              <Td className="flex-1">
                <p className="leading-8">{resource.handle}</p>
              </Td>
              <Td className="flex-1">
                <p className="leading-8">{resource.resourceType}</p>
              </Td>
              <Td className="flex-1">
                <ButtonLink
                  to={customResourceDetailUrl(resource.id)}
                  size="sm"
                  className="w-fit justify-self-end inline-flex"
                >
                  View
                </ButtonLink>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </AppSidebarLayout>
  );
};
