import { fetchInvitation, selectInvitationById } from "@app/invitations";
import { AppState } from "@app/types";
import { useQuery, useSelector } from "starfx/react";

export function useInvitation(redirectPath: string) {
  let inviteId = "";
  let code = "";
  if (redirectPath.includes("/claim/")) {
    const claim = redirectPath.replace("/claim/", "");
    [inviteId, code] = claim.split("/");
  }

  useQuery(fetchInvitation({ id: inviteId }));
  const invitation = useSelector((s: AppState) =>
    selectInvitationById(s, { id: inviteId }),
  );

  return { invitation, inviteId, code };
}
