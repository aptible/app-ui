import {
  fetchMembershipsByRole,
  selectMembershipsByRoleId,
  updateMembership,
  updateUserMemberships,
} from "@app/auth";
import { prettyDate } from "@app/date";
import { selectCanUserManageRole } from "@app/deploy";
import { createInvitation } from "@app/invitations";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { selectRoleById } from "@app/roles";
import { teamPendingInvitesUrl } from "@app/routes";
import type { Membership } from "@app/types";
import {
  selectCurrentUserId,
  selectUserById,
  selectUsersAsList,
} from "@app/users";
import { emailValidator, existValidtor } from "@app/validator";
import { type ChangeEvent, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { usePaginate, useUserIdsForRole } from "../hooks";
import { useValidator } from "../hooks";
import { RoleDetailLayout } from "../layouts";
import {
  ActionBar,
  BannerMessages,
  Button,
  CheckBox,
  DescBar,
  EmptyTr,
  FilterBar,
  FormGroup,
  Group,
  // IconPlusCircle,
  Input,
  PaginateBar,
  Select,
  type SelectOption,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
} from "../shared";

function MemberRow({
  membership,
  onDelete,
  isLoading,
  canManage,
}: {
  membership: Membership;
  onDelete?: (id: string) => void;
  isLoading: boolean;
  canManage: boolean;
}) {
  const dispatch = useDispatch();
  const user = useSelector((s) => selectUserById(s, { id: membership.userId }));
  const onChange = (ev: ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    dispatch(
      updateMembership({
        id: membership.id,
        privileged: ev.currentTarget.checked,
      }),
    );
  };

  return (
    <Tr>
      <Td>{user.name}</Td>
      <Td>{user.email}</Td>
      <Td variant="center">{user.otpEnabled ? "Enabled" : "Disabled"}</Td>
      <Td variant="center">{prettyDate(membership.createdAt)}</Td>
      <Td>
        <CheckBox
          label=""
          checked={membership.privileged}
          disabled={!canManage}
          onChange={onChange}
        />
      </Td>
      <Td variant="right">
        {onDelete ? (
          <Button
            size="sm"
            className="w-fit justify-self-end inline-flex"
            requireConfirm
            variant="delete"
            onClick={() => onDelete(user.id)}
            isLoading={isLoading}
          >
            Remove
          </Button>
        ) : null}
      </Td>
    </Tr>
  );
}

export function RoleDetailMembersPage() {
  const { id = "" } = useParams();
  useQuery(fetchMembershipsByRole({ roleId: id }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = useSelector((s) => selectRoleById(s, { id }));
  const { trigger, userIds } = useUserIdsForRole(role.id);
  const memberships = useSelector((s) =>
    selectMembershipsByRoleId(s, { roleId: id }),
  );
  const paginated = usePaginate(memberships);

  const allUsers = useSelector(selectUsersAsList);
  const userOpts = [
    { label: "Select Existing User", value: "" },
    ...allUsers
      .filter((user) => {
        return !userIds.includes(user.id);
      })
      .map((user) => {
        return {
          label: user.name,
          value: user.id,
        };
      }),
  ];
  const userId = useSelector(selectCurrentUserId);
  const orgId = useSelector(selectOrganizationSelectedId);
  const canManage = useSelector((s) =>
    selectCanUserManageRole(s, { roleId: id, userId, orgId }),
  );

  interface FormData {
    email: string;
    roleId: string;
  }

  const validators = {
    email: (data: FormData) => emailValidator(data.email),
    role: (data: FormData) => existValidtor(data.roleId, "role"),
  };

  const [email, setEmail] = useState("");
  const data = { email, roleId: id };
  const action = createInvitation(data);
  const inviteLoader = useLoader(action);

  const [errors, validate] = useValidator<FormData, typeof validators>(
    validators,
  );

  const onInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) {
      return;
    }
    dispatch(action);
  };

  useLoaderSuccess(inviteLoader, () => {
    navigate(teamPendingInvitesUrl());
  });

  const [existingUserId, setExistingUserId] = useState("");
  const onSelect = (opt: SelectOption) => {
    setExistingUserId(opt.value);
  };
  const onAddExistingUser = () => {
    dispatch(
      updateUserMemberships({ userId: existingUserId, add: [id], remove: [] }),
    );
  };
  const onDelete = (userId: string) => {
    dispatch(updateUserMemberships({ userId, add: [], remove: [id] }));
  };
  const loader = useLoader(updateUserMemberships);
  useLoaderSuccess(loader, () => {
    trigger();
  });
  const updateAdminLoader = useLoader(updateMembership);

  return (
    <RoleDetailLayout>
      <Group className="mt-4">
        <Group size="sm">
          <FilterBar>
            {canManage ? (
              <ActionBar>
                <Group variant="horizontal" size="sm">
                  <Group variant="horizontal" size="sm">
                    <Select
                      ariaLabel="add-existing-user"
                      options={userOpts}
                      onSelect={onSelect}
                      value={existingUserId}
                    />
                    <Button
                      onClick={onAddExistingUser}
                      isLoading={loader.isLoading}
                      disabled={userOpts.length === 1}
                    >
                      Add User
                    </Button>
                  </Group>

                  <form onSubmit={onInvite}>
                    <Group variant="horizontal" size="sm">
                      <BannerMessages {...inviteLoader} />

                      <FormGroup
                        label=""
                        htmlFor="email"
                        feedbackMessage={errors.email}
                        feedbackVariant={errors.email ? "danger" : "info"}
                      >
                        <Input
                          id="email"
                          name="email"
                          placeholder="Email..."
                          value={email}
                          onChange={(e) => setEmail(e.currentTarget.value)}
                        />
                      </FormGroup>
                      <Button
                        type="submit"
                        name="inviteUser"
                        isLoading={inviteLoader.isLoading}
                      >
                        Invite New User
                      </Button>
                    </Group>
                  </form>
                </Group>
              </ActionBar>
            ) : null}

            <BannerMessages {...loader} />
            <BannerMessages {...updateAdminLoader} />

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
            <Th variant="center">2FA Status</Th>
            <Th variant="center">Added Date</Th>
            <Th>Role Admin</Th>
            <Th variant="right">Actions</Th>
          </THead>

          <TBody>
            {paginated.data.length === 0 ? (
              <EmptyTr colSpan={6}>
                {role.name} currently has no members.
              </EmptyTr>
            ) : null}
            {paginated.data.map((membership) => (
              <MemberRow
                key={membership.id}
                membership={membership}
                isLoading={loader.isLoading}
                onDelete={canManage ? onDelete : undefined}
                canManage={canManage}
              />
            ))}
          </TBody>
        </Table>
      </Group>
    </RoleDetailLayout>
  );
}
