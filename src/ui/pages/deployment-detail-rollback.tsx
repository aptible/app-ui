import { selectAppById } from "@app/deploy";
import { rollbackDeployment, selectDeploymentById } from "@app/deployment";
import { useDispatch, useSelector } from "@app/react";
import { appActivityUrl } from "@app/routes";
import { useNavigate, useParams } from "react-router";
import { useLoader, useLoaderSuccess } from "starfx/react";
import {
  Banner,
  BannerMessages,
  Box,
  ButtonCreate,
  Group,
  tokens,
} from "../shared";

export function DeploymentDetailRollbackPage() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deployment = useSelector((s) => selectDeploymentById(s, { id }));
  const app = useSelector((s) => selectAppById(s, { id: deployment.appId }));
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
    <Box>
      <Group>
        <h3 className={tokens.type.h3}>ROLLBACK</h3>

        <div>
          Rollback an App deployment to a previous source code and
          configuration. This action will reuse all the same resources that were
          used to have a healthy App.
        </div>

        {isActive ? (
          <Banner variant="error">
            This is already the current active deployment for the App so we
            cannot rollback.
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
            Rollback to this Deployment
          </ButtonCreate>
        </form>
      </Group>
    </Box>
  );
}
