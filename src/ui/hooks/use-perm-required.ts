import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { selectUserHasPerms } from "@app/deploy";
import { homeUrl } from "@app/routes";
import { AppState, PermissionScope } from "@app/types";

export const usePermsRequired = ({
  scope,
  envId,
}: {
  scope: PermissionScope;
  envId: string;
}) => {
  const navigate = useNavigate();
  const hasPerms = useSelector((s: AppState) =>
    selectUserHasPerms(s, { scope, envId }),
  );
  useEffect(() => {
    if (!hasPerms) {
      navigate(homeUrl());
    }
  }, [hasPerms]);
};
