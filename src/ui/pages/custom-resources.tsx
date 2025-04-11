import { fetchCustomResources } from "@app/deploy/custom-resource";
import { selectCustomResourcesByResourceType } from "@app/deploy/custom-resource";
import { selectCustomResourcesForTableSearch } from "@app/deploy/search";
import { useQuery, useSelector } from "@app/react";
import { customResourceDetailUrl } from "@app/routes";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePaginate } from "../hooks/use-paginate";
import { AppSidebarLayout } from "../layouts";
import {
  Box,
  Button,
  ButtonLink,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  InputSearch,
  Label,
  PaginateBar,
  Select,
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
  const resourceType = params.get("resource_type") || "all";

  const FILTER_ALL = "all";
  const [resourceTypeFilter, setResourceTypeFilter] = useState(resourceType);

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams(
      {
        search: ev.currentTarget.value,
        resource_type: resourceType,
      },
      { replace: true },
    );
  };

  // Get all custom resources for search and to extract available resource types
  const allCustomResources = useSelector((s) =>
    selectCustomResourcesForTableSearch(s, { search }),
  );

  // Extract unique resource types for the filter dropdown
  const uniqueResourceTypes = [
    ...new Set(allCustomResources.map((res) => res.resourceType)),
  ].sort();
  const resourceTypeOptions = [
    { label: "All", value: FILTER_ALL },
    ...uniqueResourceTypes.map((type) => ({
      label: type,
      value: type,
    })),
  ];

  // Filter resources by type if a specific type is selected
  const filteredResources = useSelector((s) =>
    resourceType === FILTER_ALL
      ? selectCustomResourcesForTableSearch(s, { search })
      : selectCustomResourcesByResourceType(s, { resourceType }).filter((res) =>
          res.handle.toLowerCase().includes(search.toLowerCase()),
        ),
  );

  const paginated = usePaginate(filteredResources);

  const onFilter = () => {
    setParams(
      {
        search,
        resource_type: resourceTypeFilter,
      },
      { replace: true },
    );
  };

  const onReset = () => {
    setResourceTypeFilter(FILTER_ALL);
    setParams({ search }, { replace: true });
  };

  return (
    <AppSidebarLayout>
      <TitleBar description="Manage your resources.">Software Catalog</TitleBar>

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
          <DescBar>{paginated.totalItems} Resources</DescBar>
          <PaginateBar {...paginated} />
        </Group>
      </FilterBar>

      <Box>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onFilter();
          }}
        >
          <Group>
            <Group variant="horizontal">
              <div className="flex-1">
                <Label htmlFor="resource-type-selector">Resource Type</Label>
                <Select
                  id="resource-type-selector"
                  value={resourceTypeFilter}
                  options={resourceTypeOptions}
                  onSelect={(opt) => setResourceTypeFilter(opt.value)}
                  className="w-full"
                />
              </div>
            </Group>

            <hr />

            <Group
              variant="horizontal"
              className="items-center justify-between"
            >
              <Group variant="horizontal" size="sm">
                <Button type="submit">Filter</Button>
                <Button variant="white" onClick={onReset}>
                  Reset
                </Button>
              </Group>
            </Group>
          </Group>
        </form>
      </Box>

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
