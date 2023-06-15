import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { selectEnvironmentById, selectStackById } from "@app/deploy";
import { environmentDetailUrl } from "@app/routes";
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

  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div>
        <Link
          to={environmentDetailUrl(env.id)}
          className={tokens.type["table link"]}
        >
          {env.handle}
        </Link>
        <div className={tokens.type["normal lighter"]}>
          {stack.organizationId ? "Dedicated Stack " : "Shared Stack "}(
          {stack.region})
        </div>
      </div>
    </Td>
  );
};
