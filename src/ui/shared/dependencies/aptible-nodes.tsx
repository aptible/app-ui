import { databaseDetailUrl } from "@app/routes";

import { selectAppById, selectDatabaseById } from "@app/deploy";
import { useSelector } from "@app/react";
import { appDetailUrl } from "@app/routes";
import { Link } from "react-router";
import { IconCylinder } from "../icons";
import { IconBox } from "../icons";
import { type ResourceNodeProps, StandardNode } from "./node";

export const AppNode = ({ id, isRoot }: ResourceNodeProps) => {
  const app = useSelector((s) => selectAppById(s, { id }));
  const providerIconUrl = "/aptible-mark.png";

  return (
    <StandardNode isRoot={isRoot} providerIconUrl={providerIconUrl}>
      <div className="flex gap-x-1 items-center">
        <div className="flex w-5 h-5 items-center justify-center">
          <IconBox />
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono">
          {isRoot ? (
            <span className="">{app?.handle}</span>
          ) : (
            <Link
              className="text-gray-500 underline hover:no-underline"
              to={appDetailUrl(id)}
            >
              {app?.handle}
            </Link>
          )}
        </div>
      </div>
    </StandardNode>
  );
};

export const DatabaseNode = ({ id, isRoot }: ResourceNodeProps) => {
  const db = useSelector((s) => selectDatabaseById(s, { id }));

  let icon = <IconCylinder />;

  if (db?.type) {
    icon = (
      <img
        src={`/database-types/logo-${db.type}.png`}
        alt={`${db.type} Database`}
      />
    );
  }

  const providerIconUrl = "/aptible-mark.png";

  return (
    <StandardNode isRoot={isRoot} providerIconUrl={providerIconUrl}>
      <div className="flex gap-x-1 items-center justify-between">
        <div className="flex gap-x-1 items-center">
          <div className="flex w-5 h-5 items-center justify-center">{icon}</div>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono">
            {isRoot ? (
              <span className="">{db?.handle}</span>
            ) : (
              <Link
                className="text-gray-500 underline hover:no-underline"
                to={databaseDetailUrl(id)}
              >
                {db?.handle}
              </Link>
            )}
          </div>
        </div>
      </div>
    </StandardNode>
  );
};
