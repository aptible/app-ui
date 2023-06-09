import { useSelector } from "react-redux";

import { selectEnvironmentById, selectStackById } from "@app/deploy";
import { AppState } from "@app/types";

import { Td } from "./table";
import { tokens } from "./tokens";

export const EnvStackCell = ({ environmentId }: { environmentId: string }) => {
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: environmentId }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: env.stackId }),
  );

  const content = stack ? (
    <div>
      <div className={tokens.type.darker}>{env.handle}</div>
      <div className={tokens.type["normal lighter"]}>
        {stack.organizationId ? "Dedicated Stack " : "Shared Stack "}(
        {stack.region})
      </div>
    </div>
  ) : (
    <span>Loading...</span>
  );

  return <Td className="2xl:flex-cell-md sm:flex-cell-sm">{content}</Td>;
};
