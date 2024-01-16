import { fetchMembershipsByRole } from "@app/auth";
import { selectCanUserManageRole } from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { deleteRole, selectRoleById, updateRoleName } from "@app/roles";
import { teamRolesUrl } from "@app/routes";
import { Role } from "@app/types";
import { selectCurrentUserId } from "@app/users";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { RoleDetailLayout } from "../layouts";
import {
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Group,
  IconAlertTriangle,
  IconTrash,
  Input,
} from "../shared";

function RoleNameChange({
  role,
  canManage,
}: { role: Role; canManage: boolean }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(role.name);
  const loader = useLoader(updateRoleName);
  const isDisabled = !canManage || name === role.name;
  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    dispatch(updateRoleName({ id: role.id, name }));
  };
  const onReset = () => {
    setName(role.name);
  };
  useEffect(() => {
    setName(role.name);
  }, [role.name]);

  return (
    <form onSubmit={onSubmit}>
      <Group>
        <h3 className="text-lg text-gray-500">Role Settings</h3>

        <BannerMessages {...loader} />

        <FormGroup label="Role Name" htmlFor="name">
          <Input
            disabled={loader.isLoading}
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            id="name"
          />
        </FormGroup>

        <Group variant="horizontal">
          <Button
            type="submit"
            isLoading={loader.isLoading}
            disabled={isDisabled}
          >
            Save
          </Button>
          <Button variant="white" onClick={onReset}>
            Cancel
          </Button>
        </Group>
      </Group>
    </form>
  );
}

function RoleDelete({ role, canManage }: { role: Role; canManage: boolean }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const action = deleteRole({ id: role.id });
  const loader = useLoader(action);
  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    navigate(teamRolesUrl());
  });

  const isDisabled = !canManage || role.name !== deleteConfirm;

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2 mb-4">
        <IconAlertTriangle color="#AD1A1A" />
        Delete Role
      </h1>

      <Group>
        <p>
          This will permanently delete the <strong>{role.name}</strong> role.
          This action cannot be undone. If you want to proceed, type{" "}
          <strong>{role.name}</strong> below to continue.
        </p>

        <Group variant="horizontal" size="sm" className="items-center">
          <Input
            className="flex-1"
            disabled={loader.isLoading}
            name="delete-confirm"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
            id="delete-confirm"
          />
          <Button
            type="submit"
            variant="delete"
            className="w-70 flex"
            disabled={isDisabled}
            isLoading={loader.isLoading}
          >
            <IconTrash color="#FFF" className="mr-2" />
            Delete Permenantly
          </Button>
        </Group>
      </Group>
    </form>
  );
}

export function RoleDetailSettingsPage() {
  const { id = "" } = useParams();
  const role = useSelector((s) => selectRoleById(s, { id }));
  const userId = useSelector(selectCurrentUserId);
  const orgId = useSelector(selectOrganizationSelectedId);
  useQuery(fetchMembershipsByRole({ roleId: id }));
  const canManage = useSelector((s) =>
    selectCanUserManageRole(s, { roleId: id, userId, orgId }),
  );

  return (
    <RoleDetailLayout>
      <Group>
        <Box>
          <RoleNameChange role={role} canManage={canManage} />
        </Box>

        <Box>
          <RoleDelete role={role} canManage={canManage} />
        </Box>
      </Group>
    </RoleDetailLayout>
  );
}
