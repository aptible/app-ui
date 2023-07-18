import { getStackType } from "@app/deploy";
import { stackDetailEnvsUrl } from "@app/routes";
import { DeployStack } from "@app/types";
import { Link } from "react-router-dom";

export const StackItemView = ({ stack }: { stack: DeployStack }) => {
  const stackType = getStackType(stack);
  return (
    <div className="flex items-center">
      <img
        src={
          stackType === "dedicated"
            ? "/resource-types/logo-dedicated-stack.png"
            : "/resource-types/logo-stack.png"
        }
        alt="stack icon"
        className="w-8 h-8 mr-2"
      />
      <Link
        to={stackDetailEnvsUrl(stack.id)}
        className="text-black group hover:text-indigo"
      >
        {stack.name}
      </Link>
    </div>
  );
};
