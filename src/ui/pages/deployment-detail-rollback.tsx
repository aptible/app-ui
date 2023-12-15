import { selectAppById, selectOperationById } from "@app/deploy";
import { selectDeploymentById } from "@app/deployment";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

export function DeploymentDetailRollbackPage() {
  const { id = "" } = useParams();
  const deployment = useSelector((s: AppState) =>
    selectDeploymentById(s, { id }),
  );
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const op = useSelector((s: AppState) => selectOperationById(s, { id }));

  return (
    <div>
      <h3>ROLLBACK</h3>
      <div>
        Deployment detail {deployment.id} {app.id} {op.id}
      </div>
    </div>
  );
}
