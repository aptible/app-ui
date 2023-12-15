import { selectAppById } from "@app/deploy";
import { selectDeploymentById } from "@app/deployment";
import { AppState, Deployment } from "@app/types";
import { useState } from "react";
import { useSelector } from "react-redux";
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
  const envs = configToTextSegment(deployment.config);

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
  const deployment = useSelector((s: AppState) =>
    selectDeploymentById(s, { id }),
  );
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  return (
    <Box>
      <Group size="sm">
        <h3 className={tokens.type.h3}>Current Environment Variables</h3>
        <ConfigView deployment={deployment} envId={app.environmentId} />
      </Group>
    </Box>
  );
}
