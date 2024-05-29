import type { Timestamps } from "./helpers";

export interface User {
  id: string;
  name: string;
  email: string;
  otpEnabled: boolean;
  superuser: boolean;
  readOnlyImpersonate: boolean;
  username: string;
  verified: boolean;
  currentOtpId: string;
  selectedOrganizationId: string;
}

export interface Token {
  tokenId: string;
  accessToken: string;
  userUrl: string;
  actorUrl: string;
}

export type RoleType =
  | "owner"
  | "platform_owner"
  | "platform_user"
  | "compliance_user"
  | "compliance_owner";

export interface Role extends Timestamps {
  id: string;
  name: string;
  type: RoleType;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  updatedAt: string;
  reauthRequired: boolean;
  billingDetailId: string;
  ssoEnforced: boolean;
  city: string;
  address: string;
  emergencyPhone: string;
  opsAlertEmail: string;
  securityAlertEmail: string;
  primaryPhone: string;
  state: string;
  zip: string;
}

export interface U2fDevice {
  id: string;
  name: string;
  version: string;
  keyHandle: string;
  createdAt: string;
  updatedAt: string;
}

export interface Otp {
  id: string;
  uri: string;
  recoveryCodesUrl: string;
  currentUrl: string;
}

export interface Membership extends Timestamps {
  id: string;
  privileged: boolean;
  userId: string;
  roleId: string;
}
