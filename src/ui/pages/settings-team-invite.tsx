import { selectRolesEditable } from "@app/deploy";
import { createInvitation } from "@app/invitations";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { fetchRoles } from "@app/roles";
import { teamMembersUrl, teamPendingInvitesUrl } from "@app/routes";
import { emailValidator, existValidator } from "@app/validator";
import { useState } from "react";
import { useNavigate } from "react-router";
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
  role: (data: FormData) => existValidator(data.roleId, "role"),
};

export function TeamInvitePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orgId = useSelector(selectOrganizationSelectedId);
  useQuery(fetchRoles({ orgId }));
  const roles = useSelector((s) => selectRolesEditable(s, { orgId }));
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
          { name: "Members", to: teamMembersUrl() },
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
              feedbackVariant={errors.email ? "danger" : "info"}
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
              feedbackVariant={errors.role ? "danger" : "info"}
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
