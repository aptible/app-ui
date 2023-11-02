import { HalEmbedded, LinkResponse } from "./hal";

export interface Invitation {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  organizationName: string;
  inviterName: string;
  roleName: string;
  expired: boolean;
  organizationId: string;
}

export interface InvitationResponse {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  organization_name: string;
  inviter_name: string;
  role_name: string;
  verification_code_expires_at: string;
  _links: {
    organization: LinkResponse;
  };
}

export type InvitationsResponse = HalEmbedded<{
  invitations: InvitationResponse[];
}>;

export interface InvitationRequest {
  invitationId: string;
  verificationCode: string;
}
