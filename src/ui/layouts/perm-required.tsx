import { fetchCurrentToken } from "@app/auth";
import { FETCH_REQUIRED_DATA } from "@app/bootup";
import { selectIsAccountOwner, selectUserHasPerms } from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useLoader, useSelector } from "@app/react";
import { homeUrl } from "@app/routes";
import { schema } from "@app/schema";
import type { PermissionScope } from "@app/types";
import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Loading } from "../shared";

export const AccountOwnerRequired = ({
  children,
}: { children?: React.ReactNode }) => {
  const orgId = useSelector(selectOrganizationSelectedId);
  const isAccountOwner = useSelector((s) => selectIsAccountOwner(s, { orgId }));
  const loader = useSelector((s) =>
    schema.loaders.selectById(s, { id: FETCH_REQUIRED_DATA }),
  );

  if (!loader.isLoading && !isAccountOwner) {
    return <Navigate to={homeUrl()} />;
  }

  return children ? children : <Outlet />;
};

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
  const hasPerm = useSelector((s) => selectUserHasPerms(s, { envId, scope }));
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
