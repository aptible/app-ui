import { selectIsUserOwner } from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { useQuery, useSelector } from "@app/react";
import { teamInviteUrl, teamMembersEditUrl } from "@app/routes";
import type { User } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { fetchUsers, selectUsersForSearchTable } from "@app/users";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ActionBar,
  ButtonAnyOwner,
  ButtonLink,
  CsvButton,
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

function generateMembersCsv(users: User[]) {
  let csv = "id,name,email,verified,2fa\n";
  users.forEach((user) => {
    csv += `${user.id},${user.name},${user.email},${user.verified},${user.otpEnabled}\n`;
  });
  return csv;
}

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
  const users = useSelector((s) => selectUsersForSearchTable(s, { search }));
  const paginated = usePaginate(users);
  const onInvite = () => {
    navigate(teamInviteUrl());
  };
  const isOwner = useSelector((s) => selectIsUserOwner(s, { orgId }));

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
              <Group variant="horizontal" size="sm">
                <CsvButton
                  csv={() => generateMembersCsv(users)}
                  title={`aptible_${org.name.toLocaleLowerCase()}_members`}
                />
                <ButtonAnyOwner
                  onClick={onInvite}
                  tooltipProps={{ placement: "left" }}
                >
                  <IconPlusCircle variant="sm" className="mr-2" />
                  Invite User
                </ButtonAnyOwner>
              </Group>
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
          <Th>Name</Th>
          <Th>Email</Th>
          <Th variant="center">Verified</Th>
          <Th variant="center">MFA Status</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((user) => (
            <Tr key={user.id}>
              <Td>
                <div className={tokens.type.darker}>{user.name}</div>
              </Td>
              <Td>
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
