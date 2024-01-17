import { useCache } from "@app/react";
import { fetchUsersForRole } from "@app/roles";

export function useUserIdsForRole(roleId: string) {
  const ownersReq = useCache(fetchUsersForRole({ roleId }));
  const init = { trigger: ownersReq.trigger, userIds: [] };
  if (!ownersReq.data) return init;
  if (typeof ownersReq.data === "string") return init;
  const owners = ownersReq.data?._embedded.users || [];
  return { trigger: ownersReq.trigger, userIds: owners.map((u) => `${u.id}`) };
}
