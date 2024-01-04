import {
  hasDeployEndpoint,
  hasDeployOperation,
  selectDatabasesByEnvId,
  selectFirstEndpointByAppId,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestProvisionOps,
} from "@app/deploy";
import { useSelector } from "@app/react";
import { useMemo } from "react";

export const useProjectOps = ({
  appId,
  envId,
}: { appId: string; envId: string }) => {
  const deployOp = useSelector((s) => selectLatestDeployOp(s, { appId }));
  const configOp = useSelector((s) => selectLatestConfigureOp(s, { appId }));

  const vhost = useSelector((s) => selectFirstEndpointByAppId(s, { appId }));
  const dbs = useSelector((s) => selectDatabasesByEnvId(s, { envId }));

  const resourceIds = useMemo(() => {
    const arr = [...dbs.map((db) => db.id)];
    if (hasDeployEndpoint(vhost)) {
      arr.push(vhost.id);
    }
    return arr;
  }, [dbs, vhost]);

  const provisionOps = useSelector((s) =>
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
