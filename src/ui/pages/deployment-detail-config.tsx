import {
  fetchConfiguration,
  selectAppById,
  selectAppConfigById,
} from "@app/deploy";
import { selectDeploymentById } from "@app/deployment";
import { useQuery, useSelector } from "@app/react";
import { Deployment } from "@app/types";
import { useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  ButtonFullVisibility,
  Group,
  PreBox,
  configToTextSegment,
  tokens,
} from "../shared";

const ConfigView = ({
  deployment,
  envId,
}: { deployment: Deployment; envId: string }) => {
  const [isVisible, setVisible] = useState(false);
  useQuery(fetchConfiguration({ id: deployment.configurationId }));
  const config = useSelector((s) =>
    selectAppConfigById(s, { id: deployment.configurationId }),
  );
  const envs = configToTextSegment(config.env);

  return (
    <>
      {isVisible ? (
        <Group size="sm">
          <div>
            <ButtonFullVisibility
              envId={envId}
              variant="white"
              onClick={() => setVisible(false)}
            >
              Hide
            </ButtonFullVisibility>
          </div>
          <PreBox allowCopy segments={envs} />
        </Group>
      ) : (
        <div>
          <ButtonFullVisibility
            envId={envId}
            variant="white"
            onClick={() => setVisible(true)}
          >
            Show
          </ButtonFullVisibility>
        </div>
      )}
    </>
  );
};

export function DeploymentDetailConfigPage() {
  const { id = "" } = useParams();
  const deployment = useSelector((s) => selectDeploymentById(s, { id }));
  const app = useSelector((s) => selectAppById(s, { id }));

  return (
    <Box>
      <Group size="sm">
        <h3 className={tokens.type.h3}>Current Environment Variables</h3>
        <ConfigView deployment={deployment} envId={app.environmentId} />
      </Group>
    </Box>
  );
}
