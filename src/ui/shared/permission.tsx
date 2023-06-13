import { selectUserHasPerms } from "@app/deploy";
import { AppState, PermissionScope } from "@app/types";
import { useSelector } from "react-redux";

export const PermissionGate = ({
  envId,
  scope,
  children,
}: {
  envId: string;
  scope: PermissionScope;
  children: React.ReactNode;
}) => {
  const hasPerm = useSelector((s: AppState) =>
    selectUserHasPerms(s, { envId, scope }),
  );

  if (!hasPerm) {
    return null;
  }

  return <>{children}</>;
};
