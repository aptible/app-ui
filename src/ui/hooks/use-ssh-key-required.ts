import { createProjectAddKeyUrl } from "@app/routes";
import { fetchSSHKeys } from "@app/ssh-keys";
import { HalEmbedded } from "@app/types";
import { selectCurrentUser } from "@app/users";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCache, useLoaderSuccess } from "saga-query/react";

export function useSshKeyRequired() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const stackId = params.get("stack_id") || "";
  const envId = params.get("environment_id") || "";
  const queryParam = `stack_id=${stackId}&environment_id=${envId}`;
  const user = useSelector(selectCurrentUser);
  const query = useCache<HalEmbedded<{ ssh_keys: any[] }>>(
    fetchSSHKeys({ userId: user.id }),
  );

  useLoaderSuccess(query, () => {
    if (!query.data) return;
    if (query.data._embedded.ssh_keys.length === 0) {
      navigate(createProjectAddKeyUrl(queryParam), { replace: true });
    }
  });
}