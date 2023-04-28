import { api } from "@app/api";
import { LinkResponse } from "@app/types";

export interface DeployCodeScanResponse {
  id: number;
  aptible_yml_present: boolean;
  dockerfile_present: boolean;
  procfile_present: boolean;
  _links: {
    app: LinkResponse;
    operation: LinkResponse;
  };
  _type: "code_scan_result";
}

export const defaultCodeScanResponse = (
  c: Partial<DeployCodeScanResponse> = {},
): DeployCodeScanResponse => {
  return {
    id: 0,
    aptible_yml_present: false,
    dockerfile_present: false,
    procfile_present: false,
    _links: {
      app: { href: "" },
      operation: { href: "" },
    },
    _type: "code_scan_result",
    ...c,
  };
};

export const fetchCodeScanResult = api.get<{ id: string }>(
  "/code_scan_results/:id",
  api.cache(),
);
