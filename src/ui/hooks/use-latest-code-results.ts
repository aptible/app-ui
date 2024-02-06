import { findLatestDate } from "@app/date";
import {
  fetchAppOperations,
  hasDeployOperation,
  selectLatestDeployOpWithCodeScan,
  selectLatestSuccessScanOp,
} from "@app/deploy";
import { fetchCodeScanResult } from "@app/deploy";
import { useCache, useQuery } from "@app/react";
import { useSelector } from "@app/react";
import { DeployOperation } from "@app/types";

function findValidOp(opA: DeployOperation, opB: DeployOperation) {
  if (!hasDeployOperation(opA)) {
    return opB;
  }
  if (!hasDeployOperation(opB)) {
    return opA;
  }
  return findLatestDate(opA, opB);
}

export const useLatestCodeResults = (appId: string) => {
  const appOps = useQuery(fetchAppOperations({ id: appId }));
  const scanOp = useSelector((s) => selectLatestSuccessScanOp(s, { appId }));
  const deployOp = useSelector((s) =>
    selectLatestDeployOpWithCodeScan(s, { appId }),
  );
  // we need to pluck the latest code scan information from the latest scan or deploy op
  const op = findValidOp(scanOp, deployOp);

  const codeScan = useCache(
    fetchCodeScanResult({
      id: op.codeScanResultId,
    }),
  );
  const gitRef = op.gitRef || "main";

  return { op, gitRef, codeScan, appOps };
};
