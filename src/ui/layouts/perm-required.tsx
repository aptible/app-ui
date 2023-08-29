import { useLoader } from "@app/fx";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

import { fetchCurrentToken } from "@app/auth";
import { homeUrl } from "@app/routes";

import { selectUserHasPerms } from "@app/deploy";
import { AppState, PermissionScope } from "@app/types";
import { Loading } from "../shared";

export const PermRequired = ({
  scope,
  envId,
  children,
}: {
  scope: PermissionScope;
  envId: string;
  children?: React.ReactNode;
}) => {
  const loader = useLoader(fetchCurrentToken);
  const hasPerm = useSelector((s: AppState) =>
    selectUserHasPerms(s, { envId, scope }),
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (loader.isLoading) {
      return;
    }

    if (!hasPerm) {
      navigate(homeUrl());
    }
  }, [hasPerm, loader]);

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
