import {
  hasDeployEndpoint,
  hasDeployOperation,
  selectDatabasesByEnvId,
  selectFirstEndpointByAppId,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestProvisionOps,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useProjectOps = ({
  appId,
  envId,
}: { appId: string; envId: string }) => {
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );
  const configOp = useSelector((s: AppState) =>
    selectLatestConfigureOp(s, { appId }),
  );

  const vhost = useSelector((s: AppState) =>
    selectFirstEndpointByAppId(s, { id: appId }),
  );
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId }),
  );

  const resourceIds = useMemo(() => {
    const arr = [...dbs.map((db) => db.id)];
    if (hasDeployEndpoint(vhost)) {
      arr.push(vhost.id);
    }
    return arr;
  }, [dbs, vhost]);

  const provisionOps = useSelector((s: AppState) =>
    selectLatestProvisionOps(s, {
      resourceIds,
    }),
  );
  const ops = useMemo(
    () =>
      [configOp, deployOp, ...provisionOps].filter((op) =>
        hasDeployOperation(op),
      ),
    [configOp, deployOp, provisionOps],
  );

  return { ops };
};
