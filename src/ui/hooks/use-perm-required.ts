import { selectUserHasPerms } from "@app/deploy";
import { useSelector } from "@app/react";
import { homeUrl } from "@app/routes";
import { PermissionScope } from "@app/types";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export const usePermsRequired = ({
  scope,
  envId,
}: {
  scope: PermissionScope;
  envId: string;
}) => {
  const navigate = useNavigate();
  const hasPerms = useSelector((s) => selectUserHasPerms(s, { scope, envId }));
  useEffect(() => {
    if (!hasPerms) {
      navigate(homeUrl());
    }
  }, [hasPerms]);
};
