import { fetchAppOperations, selectLatestSuccessScanOp } from "@app/deploy";
import { fetchCodeScanResult } from "@app/deploy";
import { useCache, useQuery } from "@app/react";
import { useSelector } from "@app/react";

export const useLatestCodeResults = (appId: string) => {
  const appOps = useQuery(fetchAppOperations({ id: appId }));
  const scanOp = useSelector((s) => selectLatestSuccessScanOp(s, { appId }));
  const codeScan = useCache(
    fetchCodeScanResult({ id: scanOp.codeScanResultId }),
  );

  return { scanOp, codeScan, appOps };
};
