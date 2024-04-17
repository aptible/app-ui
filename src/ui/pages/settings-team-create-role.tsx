import { selectOrganizationSelectedId } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { createRoleForOrg } from "@app/roles";
import { settingsUrl, teamRolesUrl } from "@app/routes";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BannerMessages,
  Breadcrumbs,
  ButtonOrgOwner,
  FormGroup,
  Group,
  Input,
} from "../shared";

export function TeamRolesCreatePage() {
  const navigate = useNavigate();
  const orgId = useSelector(selectOrganizationSelectedId);
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const trimmedName = name.trim();
  const loader = useLoader(createRoleForOrg);
  const onCreateRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(createRoleForOrg({ orgId, name: trimmedName }));
  };
  useLoaderSuccess(loader, () => {
    navigate(teamRolesUrl());
  });

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          {
            name: "Settings",
            to: settingsUrl(),
          },
          {
            name: "Roles",
            to: teamRolesUrl(),
          },
          {
            name: "New",
            to: null,
          },
        ]}
      />
      <BannerMessages {...loader} />

      <form onSubmit={onCreateRole}>
        <FormGroup label="New Role" htmlFor="role-name">
          <div className="flex gap-2">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter role name"
              name="role-name"
              id="role-name"
              className="flex-1"
            />
            <ButtonOrgOwner type="submit" disabled={trimmedName === ""}>
              Save Role
            </ButtonOrgOwner>
          </div>
        </FormGroup>
      </form>
    </Group>
  );
}
