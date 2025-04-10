import { selectCustomResourceById } from "@app/deploy";
import { useSelector } from "@app/react";
import { softwareCatalogDetailUrl } from "@app/routes";
import { Link } from "react-router";
import { IconUserCircle } from "../icons";
import { IconCloud } from "../icons";
import { type ResourceNodeProps, StandardNode } from "./node";

// Function to hash a string to a number between 0 and max-1
const hashString = (str: string, max: number): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % max;
  }
  return Math.abs(hash);
};

// Available background color classes from Tailwind's palette
// Using -50 variants for subtle background colors
const bgColorClasses = [
  "bg-orange-50",
  "bg-amber-50",
  "bg-green-50",
  "bg-emerald-50",
  "bg-teal-50",
  "bg-sky-50",
  "bg-blue-50",
  "bg-violet-50",
  "bg-purple-50",
  "bg-fuchsia-50",
  "bg-pink-50",
  "bg-rose-50",
];

export const CustomResourceNode = ({ id, isRoot }: ResourceNodeProps) => {
  const resource = useSelector((s) => selectCustomResourceById(s, { id }));

  let icon = <IconCloud />;
  let bgColor = "bg-gray-50"; // Default color

  if (resource?.resourceType) {
    // Determine icon based on resource type
    if (resource.resourceType === "aws:ecs_service") {
      icon = <img src="/resource-types/logo-ecs.png" alt="ECS Service" />;
    } else if (resource.resourceType === "aws:rds_database") {
      icon = <img src="/resource-types/logo-rds.png" alt="RDS Database" />;
    } else if (resource.resourceType === "aws:elb") {
      icon = <img src="/resource-types/logo-vhost.png" alt="ELB" />;
    } else if (resource.resourceType.includes("k8s:")) {
      icon = <img src="/resource-types/logo-eks.png" alt="Kubernetes Resource" />;
    } else if (resource.resourceType === "datadog:service") {
      icon = <img src="/resource-types/logo-datadog.png" alt="Datadog Service" />;
    } else if (resource.resourceType === "datadog:team") {
      icon = <IconUserCircle />;
    }

    // Determine background color based on hash of resource type
    const colorIndex = hashString(resource.resourceType, bgColorClasses.length);
    bgColor = bgColorClasses[colorIndex];
  }

  let providerIconUrl = undefined;
  if (resource?.resourceType) {
    if (resource.resourceType.includes("common:aws:")) {
      providerIconUrl = "/resource-types/logo-aws.png";
    }
  }

  // Don't override the background color if it's the root node
  if (isRoot) {
    bgColor = "bg-white";
  }

  return (
    <StandardNode
      isRoot={isRoot}
      providerIconUrl={providerIconUrl}
      bgColor={bgColor}
    >
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
