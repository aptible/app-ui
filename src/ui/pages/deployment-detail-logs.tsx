import { selectAppById, selectOperationById } from "@app/deploy";
import { selectDeploymentById } from "@app/deployment";
import { useSelector } from "@app/react";
import { useParams } from "react-router";
import { LogViewer } from "../shared";

export function DeploymentDetailLogsPage() {
  const { id = "" } = useParams();
  const deployment = useSelector((s) => selectDeploymentById(s, { id }));
  const app = useSelector((s) => selectAppById(s, { id: deployment.appId }));
  const op = useSelector((s) =>
    selectOperationById(s, { id: deployment.operationId }),
  );

  return (
    <div>
      Deployment detail {deployment.id} {app.id} {op.id}
      <LogViewer op={op} />
    </div>
  );
}
