import { useCache, useSelector } from "@app/react";
import { fetchSSHKeys } from "@app/ssh-keys";
import { selectCurrentUser } from "@app/users";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function useSshKeyRequired(sshKeyUrl: string) {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const query = useCache(fetchSSHKeys({ userId: user.id }));

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
