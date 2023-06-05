import { createReadableStatus } from "@app/deploy";
import { DeployOperation } from "@app/types";

export const OpStatus = ({ status }: Pick<DeployOperation, "status">) => {
  const str = createReadableStatus(status);

  if (status === "succeeded") {
    return <span className="text-forest">{str}</span>;
  }

  if (status === "failed") {
    return <span className="text-red">{str}</span>;
  }

  return <span className="text-black-500">{str}</span>;
};
