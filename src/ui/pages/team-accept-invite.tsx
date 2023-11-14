import { AUTH_LOADER_ID, logout } from "@app/auth";
import { acceptInvitation } from "@app/auth/accept-invitation";
import { selectLoaderById } from "@app/fx";
import { fetchInvitation, selectInvitationById } from "@app/invitations";
import { setRedirectPath } from "@app/redirect-path";
import { homeUrl, loginUrl, teamInviteClaimUrl } from "@app/routes";
import { AppState, Invitation } from "@app/types";
import { selectCurrentUser } from "@app/users";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useLoader, useQuery } from "saga-query/react";
import { HeroBgLayout } from "../layouts";
import { Banner, Box, Button, Group, Loading } from "../shared";

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
  const authLoader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: AUTH_LOADER_ID }),
  );
  const onAccept = () => {
    setAccepted(true);
    dispatch(action);
  };

  const onLogout = () => {
    dispatch(setRedirectPath(teamInviteClaimUrl(invitation.id, code)));
    dispatch(logout());
    navigate(loginUrl());
  };

  useEffect(() => {
    // auth loader gets marked as success after logging in so we want to
    // make sure the user clicked the accpet invite button first
    if (accepted && authLoader.status === "success") {
      navigate(homeUrl());
    }
  }, [authLoader.status, accepted]);

  if (!invitation.id) {
    return <Loading />;
  }

  if (user.email !== invitation.email) {
    return (
      <Group>
        <Banner>
          This invitation ({invitation.email}) is not associated with your
          account ({user.email}). Please log in with the correct account.
        </Banner>
        <Button onClick={onLogout}>Logout</Button>
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
        <Button onClick={onAccept} isLoading={loader.isLoading}>
          Accept Invite
        </Button>
      </div>
    </Group>
  );
}

export function TeamAcceptInvitePage() {
  const { inviteId = "", code = "" } = useParams();
  useQuery(fetchInvitation({ id: inviteId }));
  const invitation = useSelector((s: AppState) =>
    selectInvitationById(s, { id: inviteId }),
  );

  return (
    <HeroBgLayout>
      <Box>
        <AcceptInviteView invitation={invitation} code={code} />
      </Box>
    </HeroBgLayout>
  );
}
