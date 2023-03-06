import { api } from "@app/api";
import { LinkResponse } from "@app/types";

export interface DeployCodeScanResponse {
  id: number;
  aptible_yml_present: boolean;
  dockerfile_present: boolean;
  procfile_present: boolean;
  _links: {
    self: LinkResponse;
    app: LinkResponse;
    operation: LinkResponse;
  };
  _type: "code_scan_result";
}

export const fetchCodeScanResult = api.get<{ id: string }>(
  "/code_scan_results/:id",
  api.cache(),
);
