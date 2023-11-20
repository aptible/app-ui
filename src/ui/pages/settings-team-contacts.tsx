import { updateOrganization } from "@app/auth";
import { selectOrganizationSelected } from "@app/organizations";
import { Organization } from "@app/types";
import { emailValidator, existValidtor } from "@app/validator";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "starfx/react";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Group,
  Input,
  tokens,
} from "../shared";

const validators = {
  securityEmail: (org: Organization) => emailValidator(org.securityAlertEmail),
  opsEmail: (org: Organization) => emailValidator(org.opsAlertEmail),
  name: (org: Organization) => existValidtor(org.name, "name"),
};

export const TeamContactsPage = () => {
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);
  const [orgData, setOrgData] = useState(org);
  const updateOrgData = <K extends keyof Organization>(
    key: K,
    value: Organization[K],
  ) => {
    setOrgData({
      ...orgData,
      [key]: value,
    });
  };
  const action = updateOrganization(orgData);
  const loader = useLoader(action);
  const [errors, validate] = useValidator<Organization, typeof validators>(
    validators,
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(orgData)) return;
    dispatch(action);
  };
  const onCancel = () => {
    setOrgData(org);
  };

  useEffect(() => {
    setOrgData(org);
  }, [org.id, org.name]);

  return (
    <Group>
      <h2 className={tokens.type.h2}>Organization Settings</h2>
      <Box>
        <Group>
          <form onSubmit={onSubmit}>
            <Group>
              <BannerMessages {...loader} />

              <FormGroup label="Organization Name" htmlFor="org-name">
                <Input
                  id="org-name"
                  name="org-name"
                  value={orgData.name}
                  onChange={(e) => updateOrgData("name", e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup label="Primary Phone" htmlFor="phone">
                <Input
                  id="phone"
                  name="phone"
                  value={orgData.primaryPhone}
                  onChange={(e) =>
                    updateOrgData("primaryPhone", e.currentTarget.value)
                  }
                />
              </FormGroup>

              <FormGroup label="Emergency Phone" htmlFor="emergency-phone">
                <Input
                  id="emergency-phone"
                  name="emergency-phone"
                  value={orgData.emergencyPhone}
                  onChange={(e) =>
                    updateOrgData("emergencyPhone", e.currentTarget.value)
                  }
                />
              </FormGroup>

              <FormGroup
                label="Security Alert Notification Email"
                htmlFor="security-alert-email"
                feedbackMessage={errors.securityEmail}
                feedbackVariant={errors.securityEmail ? "danger" : "info"}
              >
                <Input
                  id="security-alert-email"
                  name="security-alert-email"
                  value={orgData.securityAlertEmail}
                  onChange={(e) =>
                    updateOrgData("securityAlertEmail", e.currentTarget.value)
                  }
                />
              </FormGroup>

              <FormGroup
                label="Ops Alert Notification Email"
                htmlFor="ops-alert-email"
                feedbackMessage={errors.opsEmail}
                feedbackVariant={errors.opsEmail ? "danger" : "info"}
              >
                <Input
                  id="ops-alert-email"
                  name="ops-alert-email"
                  value={orgData.opsAlertEmail}
                  onChange={(e) =>
                    updateOrgData("opsAlertEmail", e.currentTarget.value)
                  }
                />
              </FormGroup>

              <Group variant="horizontal" size="sm">
                <Button type="submit" isLoading={loader.isLoading}>
                  Save Changes
                </Button>
                <Button
                  variant="white"
                  onClick={onCancel}
                  disabled={loader.isLoading}
                >
                  Cancel
                </Button>
              </Group>
            </Group>
          </form>
        </Group>
      </Box>
    </Group>
  );
};
