import { selectAppById } from "@app/deploy";
import { rollbackDeployment, selectDeploymentById } from "@app/deployment";
import { appActivityUrl } from "@app/routes";
import { AppState } from "@app/types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useLoader, useLoaderSuccess } from "starfx/react";
import { Banner, BannerMessages, ButtonCreate, Group, tokens } from "../shared";

export function DeploymentDetailRollbackPage() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deployment = useSelector((s: AppState) =>
    selectDeploymentById(s, { id }),
  );
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: deployment.appId }),
  );
  const action = rollbackDeployment({
    envId: app.environmentId,
    appId: app.id,
    deploymentId: id,
  });
  const loader = useLoader(action);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(action);
  };
  useLoaderSuccess(loader, () => {
    navigate(appActivityUrl(app.id));
  });
  const isActive = app.currentDeploymentId === id;

  return (
    <Group>
      <h3 className={tokens.type.h3}>ROLLBACK</h3>

      <div>
        Rollback an App deployment to a previous source code and configuration
        combination. This feature will reuse all the same resources that were
        used to have a healthy App.
      </div>

      {isActive ? (
        <Banner variant="error">
          This is already the current active deployment for the App so we cannot
          rollback.
        </Banner>
      ) : null}

      <BannerMessages {...loader} />

      <form onSubmit={onSubmit}>
        <ButtonCreate
          envId={app.environmentId}
          type="submit"
          isLoading={loader.isLoading}
          variant="delete"
          disabled={isActive}
        >
          Rollback
        </ButtonCreate>
      </form>
    </Group>
  );
}
