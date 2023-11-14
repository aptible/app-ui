import { selectIsUserOwner } from "@app/deploy";
import { useQuery } from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import { teamInviteUrl, teamMembersEditUrl } from "@app/routes";
import type { AppState } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { fetchUsers, selectUsersForSearchTable } from "@app/users";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ActionBar,
  ButtonAnyOwner,
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
} from "../shared";

export const TeamMembersPage = () => {
  const navigate = useNavigate();
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
  const onInvite = () => {
    navigate(teamInviteUrl());
  };
  const isOwner = useSelector((s: AppState) => selectIsUserOwner(s, { orgId }));

  return (
    <Group>
      <Group size="sm">
        <TitleBar description="Search members by name or status by typing verified, mfa, !verified, or !mfa">
          Members
        </TitleBar>

        <FilterBar>
          <div className="flex justify-between mb-1">
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />

            <ActionBar>
              <ButtonAnyOwner onClick={onInvite}>
                <IconPlusCircle variant="sm" className="mr-2" />
                Invite User
              </ButtonAnyOwner>
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
          <Th variant="center">Verified</Th>
          <Th variant="center">MFA Status</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((user) => (
            <Tr key={user.id}>
              <Td>
                <div>{user.name}</div>
                <div>{user.email}</div>
              </Td>
              <Td variant="center">{user.verified ? "Yes" : "No"}</Td>
              <Td variant="center">
                {user.otpEnabled ? "Enabled" : "Disabled"}
              </Td>
              <Td variant="right">
                {isOwner ? (
                  <ButtonLink
                    size="sm"
                    to={teamMembersEditUrl(user.id)}
                    className="w-fit justify-self-end inline-flex"
                  >
                    Edit
                  </ButtonLink>
                ) : null}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
