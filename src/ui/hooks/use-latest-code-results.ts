import { fetchAppOperations, selectLatestSucceessScanOp } from "@app/deploy";
import {
  DeployCodeScanResponse,
  fetchCodeScanResult,
} from "@app/deploy/code-scan-result";
import { useCache, useQuery } from "@app/fx";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";

export const useLatestCodeResults = (appId: string) => {
  const appOps = useQuery(fetchAppOperations({ id: appId }));
  const scanOp = useSelector((s: AppState) =>
    selectLatestSucceessScanOp(s, { appId }),
  );

  const codeScan = useCache<DeployCodeScanResponse>(
    fetchCodeScanResult({ id: scanOp.codeScanResultId }),
  );

  return { scanOp, codeScan, appOps };
};
