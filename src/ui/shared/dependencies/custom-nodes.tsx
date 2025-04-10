import { selectCustomResourceById } from "@app/deploy";
import { useSelector } from "@app/react";
import { softwareCatalogDetailUrl } from "@app/routes";
import { Link } from "react-router";
import { IconCylinder } from "../icons";
import { IconCloud } from "../icons";
import { type ResourceNodeProps, StandardNode } from "./node";

export const CustomResourceNode = ({ id, isRoot }: ResourceNodeProps) => {
  const resource = useSelector((s) => selectCustomResourceById(s, { id }));

  let icon = <IconCloud />;

  if (resource?.resourceType) {
    if (resource.resourceType.includes(":ecs_service")) {
      icon = <img src="/resource-types/logo-ecs.png" alt="ECS Service" />;
    } else if (resource.resourceType.includes(":rds_database")) {
      icon = <img src="/resource-types/logo-rds.png" alt="RDS Database" />;
    } else if (resource.resourceType.includes(":redis_database")) {
      icon = <img src="/database-types/logo-redis.png" alt="Redis Database" />;
    } else if (resource.resourceType.includes(":database:")) {
      icon = <IconCylinder />;
    }
  }

  let providerIconUrl = undefined;
  if (resource?.resourceType) {
    if (resource.resourceType.includes("common:aws:")) {
      providerIconUrl = "/resource-types/logo-aws.png";
    }
  }

  return (
    <StandardNode isRoot={isRoot} providerIconUrl={providerIconUrl}>
      <div className="flex flex-col">
        <div className="flex gap-x-1 items-center">
          <div className="flex w-5 h-5 items-center justify-center">{icon}</div>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono">
            {isRoot ? (
              <span className="">{resource?.handle}</span>
            ) : (
              <Link
                className="text-gray-500 underline hover:no-underline"
                to={softwareCatalogDetailUrl(id)}
              >
                {resource?.handle}
              </Link>
            )}
          </div>
        </div>
        {resource?.resourceType && (
          <div className="text-xs text-gray-400 font-mono ml-6 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {resource.resourceType}
          </div>
        )}
      </div>
    </StandardNode>
  );
};
