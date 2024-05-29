import { selectUserHasPerms } from "@app/deploy";
import { useSelector } from "@app/react";
import type { PermissionScope } from "@app/types";

export const PermissionGate = ({
  envId,
  scope,
  children,
}: {
  envId: string;
  scope: PermissionScope;
  children: React.ReactNode;
}) => {
  const hasPerm = useSelector((s) => selectUserHasPerms(s, { envId, scope }));

  if (!hasPerm) {
    return null;
  }

  return <>{children}</>;
};
