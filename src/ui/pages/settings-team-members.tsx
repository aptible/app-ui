import { useQuery } from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import type { AppState } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { fetchUsers, selectUsersForSearchTable } from "@app/users";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  ActionBar,
  Button,
  ButtonOwner,
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
} from "../shared";

export const TeamMembersPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const orgId = org.id;
  useQuery(fetchUsers({ orgId }));
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const users = useSelector((s: AppState) =>
    selectUsersForSearchTable(s, { search }),
  );
  const paginated = usePaginate(users);
  const onInvite = () => {};

  return (
    <Group>
      <Group size="sm">
        <TitleBar description="This is a list of members in your Organization">
          Members
        </TitleBar>

        <FilterBar>
          <div className="flex justify-between mb-1">
            <div>
              <InputSearch
                placeholder="Search ..."
                search={search}
                onChange={onChange}
              />
              <p>
                Special search terms: <code>verified</code> and <code>mfa</code>
                . The inverse is also available: <code>!verified</code> and{" "}
                <code>!mfa</code>.
              </p>
            </div>

            <ActionBar>
              <ButtonOwner onClick={onInvite}>
                <IconPlusCircle variant="sm" className="mr-2" />
                Invite User
              </ButtonOwner>
            </ActionBar>
          </div>

          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Members</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>User</Th>
          <Th>Email</Th>
          <Th variant="center">Verified</Th>
          <Th variant="center">MFA Status</Th>
          <Th>Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((user) => (
            <Tr key={user.id}>
              <Td>
                <div>{user.name}</div>
                <div>{user.email}</div>
              </Td>
              <Td>{user.verified ? "Enabled" : "Disabled"}</Td>
              <Td>{user.otpEnabled ? "Enabled" : "Disabled"}</Td>
              <Td>
                <Button type="submit" size="sm">
                  Edit
                </Button>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
