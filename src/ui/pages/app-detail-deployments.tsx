import { prettyDateTime } from "@app/date";
import { selectAppById, selectOperationById } from "@app/deploy";
import {
  fetchDeploymentsByAppId,
  selectDeploymentsByAppId,
} from "@app/deployment";
import { operationDetailUrl } from "@app/routes";
import { AppState, Deployment } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useQuery } from "starfx/react";
import {
  Button,
  ButtonLink,
  DetailPageSections,
  Group,
  TBody,
  THead,
  Table,
  Td,
  Tr,
} from "../shared";

function DeploymentRow({ deployment }: { deployment: Deployment }) {
  const op = useSelector((s: AppState) =>
    selectOperationById(s, { id: deployment.operationId }),
  );

  return (
    <Tr>
      <Td>{deployment.id}</Td>
      <Td>{op.status}</Td>
      <Td>{op.dockerRef || op.gitRef}</Td>
      <Td>{prettyDateTime(op.createdAt)}</Td>
      <Td>
        <Group variant="horizontal" size="sm">
          <Button>Config</Button>
          <ButtonLink to={operationDetailUrl(op.id)}>Logs</ButtonLink>
          <Button>Rolleback</Button>
        </Group>
      </Td>
    </Tr>
  );
}

export function AppDetailDeploymentsPage() {
  const { id = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  useQuery(fetchDeploymentsByAppId({ id: app.id }));
  const deployments = useSelector((s: AppState) =>
    selectDeploymentsByAppId(s, { appId: app.id }),
  );

  return (
    <DetailPageSections>
      <Table>
        <THead>
          <Td>ID</Td>
          <Td>Status</Td>
          <Td>Ref</Td>
          <Td>Date</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {deployments.map((deploy) => {
            return <DeploymentRow key={deploy.id} deployment={deploy} />;
          })}
        </TBody>
      </Table>
    </DetailPageSections>
  );
}
