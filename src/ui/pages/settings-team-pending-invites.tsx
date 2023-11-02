import {
  fetchInvitations,
  resetInvitation,
  revokeInvitation,
  selectInvitationsByOrgId,
} from "@app/invitations";
import { selectOrganizationSelectedId } from "@app/organizations";
import { AppState } from "@app/types";
import { useDispatch, useSelector } from "react-redux";
import { useLoader, useQuery } from "saga-query/react";
import {
  BannerMessages,
  Button,
  EmptyTr,
  Group,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
} from "../shared";

export const TeamPendingInvitesPage = () => {
  const dispatch = useDispatch();
  const orgId = useSelector(selectOrganizationSelectedId);
  useQuery(fetchInvitations({ orgId }));
  const invitations = useSelector((s: AppState) =>
    selectInvitationsByOrgId(s, { orgId }),
  );
  const onResend = (invitationId: string) => {
    dispatch(resetInvitation({ invitationId }));
  };
  const onRevoke = (id: string) => {
    dispatch(revokeInvitation({ id }));
  };
  const revokeLoader = useLoader(revokeInvitation);
  const resendLoader = useLoader(resetInvitation);

  return (
    <Group>
      <TitleBar description="This is a list of pending invitations to join this Organization">
        Pending Invites
      </TitleBar>

      <BannerMessages {...resendLoader} />
      <BannerMessages {...revokeLoader} />

      <Table>
        <THead>
          <Th>Email</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {invitations.length === 0 ? (
            <EmptyTr colSpan={2}>No pending invitations</EmptyTr>
          ) : null}
          {invitations.map((invite) => {
            return (
              <Tr key={invite.id}>
                <Td>{invite.email}</Td>
                <Td variant="right">
                  <Group variant="horizontal" size="sm">
                    <Button
                      requireConfirm="invert"
                      size="sm"
                      onClick={() => onResend(invite.id)}
                      isLoading={resendLoader.isLoading}
                    >
                      Resend
                    </Button>
                    <Button
                      requireConfirm="invert"
                      variant="delete"
                      size="sm"
                      onClick={() => onRevoke(invite.id)}
                      isLoading={revokeLoader.isLoading}
                    >
                      Revoke
                    </Button>
                  </Group>
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
    </Group>
  );
};
