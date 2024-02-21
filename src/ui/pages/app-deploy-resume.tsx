import {
  fetchApp,
  fetchApps,
  fetchEnvironmentById,
  hasDeployApp,
  hasDeployEnvironment,
  selectAppById,
  selectEnvironmentById,
  selectFirstAppByEnvId,
  selectLatestConfigureOp,
} from "@app/deploy";
import { hasDeployOperation } from "@app/deploy";
import { useDispatch, useSelector } from "@app/react";
import { appDeployGetStartedUrl, appDeployStatusUrl } from "@app/routes";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useLatestCodeResults } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import { Loading } from "../shared";

export const AppDeployResumeWithEnvPage = () => {
  const { envId = "" } = useParams();
  const dispatch = useDispatch();
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const navigate = useNavigate();
  // just guessing which app to use to detect current status
  const app = useSelector((s) => selectFirstAppByEnvId(s, { envId }));
  const { appOps, op } = useLatestCodeResults(app.id);
  const configureOp = useSelector((s) =>
    selectLatestConfigureOp(s, { appId: app.id }),
  );

  useEffect(() => {
    dispatch(fetchApps());
  }, []);

  useEffect(() => {
    dispatch(fetchEnvironmentById({ id: envId }));
  }, [envId]);

  useEffect(() => {
    if (!hasDeployEnvironment(env) || !hasDeployApp(app)) {
      return;
    }
    if (appOps.lastSuccess === 0) {
      return;
    }

    if (hasDeployOperation(configureOp)) {
      navigate(appDeployStatusUrl(app.id));
    } else {
      navigate(appDeployGetStartedUrl(app.id));
    }
  }, [env.id, app.id, appOps, configureOp, op]);

  return (
    <AppSidebarLayout>
      <Loading text={`Detecting app ${app.handle} status...`} />
    </AppSidebarLayout>
  );
};

export const AppDeployResumePage = () => {
  const { appId = "" } = useParams();
  const dispatch = useDispatch();
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  const env = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const navigate = useNavigate();
  const { appOps, op } = useLatestCodeResults(appId);
  const configureOp = useSelector((s) => selectLatestConfigureOp(s, { appId }));

  useEffect(() => {
    dispatch(fetchApp({ id: appId }));
  }, [appId]);

  useEffect(() => {
    dispatch(fetchEnvironmentById({ id: app.environmentId }));
  }, [app]);

  useEffect(() => {
    if (!hasDeployEnvironment(env) || !hasDeployApp(app)) {
      return;
    }
    if (appOps.lastSuccess === 0) {
      return;
    }

    if (hasDeployOperation(configureOp)) {
      navigate(appDeployStatusUrl(app.id), { replace: true });
    } else {
      navigate(appDeployGetStartedUrl(app.id), { replace: true });
    }
  }, [env.id, app.id, appOps, op, configureOp]);

  return (
    <AppSidebarLayout>
      <Loading text={`Detecting app ${app.handle} status...`} />
    </AppSidebarLayout>
  );
};
