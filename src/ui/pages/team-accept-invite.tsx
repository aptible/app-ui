import { exchangeToken, logout } from "@app/auth";
import { acceptInvitation } from "@app/auth/accept-invitation";
import { fetchInvitation, selectInvitationById } from "@app/invitations";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import { setRedirectPath } from "@app/redirect-path";
import { homeUrl, loginUrl, teamAcceptInviteUrl } from "@app/routes";
import type { Invitation } from "@app/types";
import { selectCurrentUser } from "@app/users";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { HeroBgLayout } from "../layouts";
import { Banner, BannerMessages, Box, Button, Group, Loading } from "../shared";

function AcceptInviteView({
  invitation,
  code,
}: { invitation: Invitation; code: string }) {
  const [accepted, setAccepted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const action = acceptInvitation({
    invitationId: invitation.id,
    verificationCode: code,
  });
  const loader = useLoader(action);
  // This is a hack.
  // After accepting an invite we exchange the user's token so they now
  //  have access to the org resources.
  // As a result of exchanging their token, we also reset the local store
  //  which wipes all loading states.
  // So instead of relying on the loader state for `acceptInvitation`
  //  we rely on the auth loader which is set after exchanging the user
  //  token.
  const authLoader = useLoader(exchangeToken);
  const onAccept = () => {
    setAccepted(true);
    dispatch(action);
  };

  useEffect(() => {
    // auth loader gets marked as success after logging in so we want to
    // make sure the user clicked the accpet invite button first
    if (accepted && authLoader.status === "success") {
      navigate(homeUrl());
    }
  }, [authLoader.status, accepted]);

  if (!invitation.id) {
    return null;
  }

  if (user.email !== invitation.email) {
    return (
      <Group>
        <Banner>
          This invitation ({invitation.email}) is not associated with your
          account ({user.email}). Please log in with the correct account.
        </Banner>
      </Group>
    );
  }

  if (invitation.expired) {
    return (
      <Group>
        <Banner variant="error">
          This invitation to join <strong>{invitation.organizationName}</strong>{" "}
          has expired. Please request a new invite from{" "}
          <strong>{invitation.inviterName}</strong>.
        </Banner>
      </Group>
    );
  }

  return (
    <Group>
      <p>
        You have been invited to join{" "}
        <strong>{invitation.organizationName}</strong> by{" "}
        <strong>{invitation.inviterName}</strong>.
      </p>
      <p>
        You have been assigned the <strong>{invitation.roleName}</strong> role
        in this organization.
      </p>
      <div>
        <Button
          className="w-full"
          onClick={onAccept}
          isLoading={loader.isLoading}
        >
          Accept Invite
        </Button>
      </div>
    </Group>
  );
}

export function TeamAcceptInvitePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inviteId = "", code = "" } = useParams();
  const loader = useQuery(fetchInvitation({ id: inviteId }));
  const invitation = useSelector((s) =>
    selectInvitationById(s, { id: inviteId }),
  );
  const onLogout = () => {
    dispatch(setRedirectPath(teamAcceptInviteUrl(inviteId, code)));
    dispatch(logout());
    navigate(loginUrl());
  };

  return (
    <HeroBgLayout>
      <Group>
        <Box>
          <Group>
            <BannerMessages {...loader} />
            <Loading {...loader} />
            <AcceptInviteView invitation={invitation} code={code} />
          </Group>
        </Box>

        <div>
          <Button onClick={onLogout}>Logout</Button>
        </div>
      </Group>
    </HeroBgLayout>
  );
}
