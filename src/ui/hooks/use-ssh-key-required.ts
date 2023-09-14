import { fetchSSHKeys } from "@app/ssh-keys";
import { HalEmbedded } from "@app/types";
import { selectCurrentUser } from "@app/users";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCache } from "saga-query/react";

export function useSshKeyRequired(sshKeyUrl: string) {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const query = useCache<HalEmbedded<{ ssh_keys: any[] }>>(
    fetchSSHKeys({ userId: user.id }),
  );

  const prev = useRef(query);
  useEffect(() => {
    const curSuccess = !query.isLoading && query.isSuccess;
    if (prev.current.isLoading && curSuccess) {
      if (!query.data) return;
      if (query.data._embedded.ssh_keys.length === 0) {
        navigate(sshKeyUrl, { replace: true });
      }
    }
    prev.current = query;
  }, [query.isSuccess, query.isLoading]);
}
