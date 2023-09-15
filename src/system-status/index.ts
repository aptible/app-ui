import { thunks } from "@app/api";
import { addData, call, put } from "@app/fx";

interface StatusResp {
  status: { description: string; indicator: string };
}

const STATUSPAGE_ID = "fmwgqnbnbc4r";
export const STATUSPAGE_URL = `https://${STATUSPAGE_ID}.statuspage.io/api/v2/status.json`;
export const SYSTEM_STATUS_ID = "system-status";
export const fetchSystemStatus = thunks.create(
  "fetch-system-status",
  function* (_, next) {
    const resp = yield* call(() => fetch(STATUSPAGE_URL));
    const json: StatusResp = yield* call(() => resp.json());
    yield* put(addData({ [SYSTEM_STATUS_ID]: json.status }));
    yield* next();
  },
);
