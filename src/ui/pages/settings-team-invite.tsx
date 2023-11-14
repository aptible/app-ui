import { fetchRoles } from "@app/auth";
import { createInvitation } from "@app/invitations";
import { selectOrganizationSelectedId } from "@app/organizations";
import { selectRolesByOrgId } from "@app/roles";
import { teamMembersUrl, teamPendingInvitesUrl } from "@app/routes";
import { AppState } from "@app/types";
import { emailValidator, existValidtor } from "@app/validator";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useLoader, useLoaderSuccess, useQuery } from "saga-query/react";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  FormGroup,
  Group,
  Input,
  Select,
} from "../shared";

interface FormData {
  email: string;
  roleId: string;
}

const validators = {
  email: (data: FormData) => emailValidator(data.email),
  role: (data: FormData) => existValidtor(data.roleId, "must select a role"),
};

export function TeamInvitePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orgId = useSelector(selectOrganizationSelectedId);
  useQuery(fetchRoles({ orgId }));
  const roles = useSelector((s: AppState) => selectRolesByOrgId(s, { orgId }));
  const options = [
    { value: "", label: "Select a Role" },
    ...roles.map((role) => {
      return { value: role.id, label: role.name };
    }),
  ];
  const [email, setEmail] = useState("");
  const [roleId, setRole] = useState("");
  const [errors, validate] = useValidator<FormData, typeof validators>(
    validators,
  );
  const data = { email, roleId };
  const action = createInvitation(data);
  const loader = useLoader(action);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) {
      return;
    }
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    navigate(teamPendingInvitesUrl());
  });

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          { name: "Team Members", to: teamMembersUrl() },
          { name: "Invite", to: null },
        ]}
      />

      <Box>
        <form onSubmit={onSubmit}>
          <Group>
            <BannerMessages {...loader} />

            <FormGroup
              label="Email"
              htmlFor="email"
              feedbackMessage={errors.email}
            >
              <Input
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
            </FormGroup>

            <FormGroup
              label="Role"
              htmlFor="role"
              feedbackMessage={errors.role}
            >
              <Select
                options={options}
                onSelect={(opt) => setRole(opt.value)}
                value={roleId}
              />
            </FormGroup>

            <div>
              <Button type="submit" isLoading={loader.isLoading}>
                Share Invite
              </Button>
            </div>
          </Group>
        </form>
      </Box>
    </Group>
  );
}
