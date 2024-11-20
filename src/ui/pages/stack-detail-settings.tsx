import { stackDetailEnvsUrl, supportUrl } from "@app/routes";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  Box,
  ButtonLink,
  ButtonLinkDocs,
  Group,
  IconAlertTriangle,
} from "../shared";

export const StackDetailSettingsPage = () => {
  const { id = "" } = useParams();
  return (
    <Group size="sm">
      <Box className="mb-4">
        <div className="flex justify-between items-start">
          <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2 mb-4">
            <IconAlertTriangle color="#AD1A1A" />
            Deprovision Stack
          </h1>
          <ButtonLinkDocs href="https://www.aptible.com/docs/how-to-guides/platform-guides/create-deprovision-dedicated-stacks" />
        </div>
        <div className="mb-4">
          <p>
            <strong>
              If you want to deprovision this stack, you must first deprovision
              its <Link to={stackDetailEnvsUrl(id)}>environments</Link>.
            </strong>
          </p>
          <p>
            Then contact support to permanently delete this stack. This action
            cannot be undone.
          </p>
        </div>
        <ButtonLink className="w-fit font-semibold" to={supportUrl()}>
          Contact Support
        </ButtonLink>
      </Box>
    </Group>
  );
};
