import { fetchAppOperations, selectLatestSucceessScanOp } from "@app/deploy";
import { DeployCodeScanResponse, fetchCodeScanResult } from "@app/deploy";
import { useCache, useQuery } from "@app/react";
import { useSelector } from "@app/react";

export const useLatestCodeResults = (appId: string) => {
  const appOps = useQuery(fetchAppOperations({ id: appId }));
  const scanOp = useSelector((s) => selectLatestSucceessScanOp(s, { appId }));
  const codeScan = useCache<DeployCodeScanResponse>(
    fetchCodeScanResult({ id: scanOp.codeScanResultId }),
  );

  return { scanOp, codeScan, appOps };
};
