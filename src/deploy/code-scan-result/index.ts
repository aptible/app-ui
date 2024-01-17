import { api } from "@app/api";
import { LinkResponse } from "@app/types";

export interface DeployCodeScanResponse {
  id: number;
  aptible_yml_present: boolean;
  aptible_yml_data?: string;
  dockerfile_present: boolean;
  dockerfile_data?: string;
  procfile_present: boolean;
  procfile_data?: string;
  languages_detected: string[] | null;
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
    aptible_yml_data: "",
    dockerfile_present: false,
    dockerfile_data: "",
    procfile_present: false,
    procfile_data: "",
    languages_detected: [],
    _links: {
      app: { href: "" },
      operation: { href: "" },
    },
    _type: "code_scan_result",
    ...c,
  };
};

export const fetchCodeScanResult = api.get<
  { id: string },
  DeployCodeScanResponse
>("/code_scan_results/:id", api.cache());
