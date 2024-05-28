import { type StackType, getStackType } from "@app/deploy";
import { stackDetailEnvsUrl } from "@app/routes";
import type { DeployStack } from "@app/types";
import { Link } from "react-router-dom";
import { tokens } from "./tokens";

export const getStackImg = (stackType: StackType) => {
  if (stackType === "self_hosted") {
    return "/resource-types/logo-aws.png";
  }

  if (stackType === "dedicated") {
    return "/resource-types/logo-dedicated-stack.png";
  }

  return "/resource-types/logo-stack.png";
};

export const StackItemView = ({ stack }: { stack: DeployStack }) => {
  const stackType = getStackType(stack);
  return (
    <div>
      <Link
        to={stackDetailEnvsUrl(stack.id)}
        className="text-black group-hover:text-indigo hover:text-indigo flex items-center"
      >
        <img
          src={getStackImg(stackType)}
          alt="stack icon"
          className="w-[32px] h-[32px] mr-2"
        />

        {stackType === "self_hosted" ? (
          <p className="flex flex-col">
            <span className={tokens.type["table link"]}>{stack.name}</span>
            <span className={tokens.type["normal lighter"]}>
              {stack.awsAccountId}
            </span>
          </p>
        ) : (
          <span className={tokens.type["table link"]}>{stack.name}</span>
        )}
      </Link>
    </div>
  );
};
