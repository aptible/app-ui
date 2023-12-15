import { selectAppById, selectOperationById } from "@app/deploy";
import { selectDeploymentById } from "@app/deployment";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { LogViewer } from "../shared";

export function DeploymentDetailLogsPage() {
  const { id = "" } = useParams();
  const deployment = useSelector((s: AppState) =>
    selectDeploymentById(s, { id }),
  );
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: deployment.appId }),
  );
  const op = useSelector((s: AppState) =>
    selectOperationById(s, { id: deployment.operationId }),
  );

  return (
    <div>
      Deployment detail {deployment.id} {app.id} {op.id}
      <LogViewer op={op} />
    </div>
  );
}
