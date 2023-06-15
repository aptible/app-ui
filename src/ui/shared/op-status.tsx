import { createReadableStatus } from "@app/deploy";
import { DeployOperation, OperationStatus } from "@app/types";

export const resolveOperationStatuses = (
  stats: { status: OperationStatus; updatedAt: string }[],
): [OperationStatus, string] => {
  if (stats.length === 0) {
    return ["unknown", new Date().toISOString()];
  }
  // sort the statuses from least recent to most recent
  // this allows us to return-early with the proper time in which the states
  // were first determined
  const statuses = stats.sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  );

  let success = 0;
  for (let i = 0; i < statuses.length; i += 1) {
    const st = statuses[i];
    if (st.status === "queued") {
      return ["queued", st.updatedAt];
    }

    if (st.status === "running") {
      return ["running", st.updatedAt];
    }

    if (st.status === "failed") {
      return ["failed", st.updatedAt];
    }

    if (st.status === "succeeded") {
      success += 1;
    }
  }

  if (success === statuses.length) {
    return [
      "succeeded",
      statuses.at(-1)?.updatedAt || new Date().toISOString(),
    ];
  }

  return ["unknown", new Date().toISOString()];
};

export const OpStatus = ({ status }: Pick<DeployOperation, "status">) => {
  const str = createReadableStatus(status);

  if (status === "queued") {
    return <span className="font-semibold text-gray-300">{str}</span>;
  }

  if (status === "succeeded") {
    return <span className="font-semibold text-forest">{str}</span>;
  }

  if (status === "failed") {
    return <span className="font-semibold text-red">{str}</span>;
  }

  return <span className="font-semibold text-black">{str}</span>;
};
