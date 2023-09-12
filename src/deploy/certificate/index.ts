import { createAction, createSelector } from "@reduxjs/toolkit";
import { createThrottle, poll } from "saga-query";

import { PaginateProps, api, combinePages, thunks } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployCertificate, LinkResponse } from "@app/types";

import { prettyDateTime } from "@app/date";
import { selectDeploy } from "../slice";

interface DeployCertificateResponse {
  id: number;
  common_name: string;
  certificate_body: string;
  not_before: string;
  not_after: string;
  issuer_country?: string;
  issuer_organization?: string;
  issuer_website?: string;
  issuer_common_name?: string;
  subject_country?: string;
  subject_state?: string;
  subject_locale?: string;
  subject_organization?: string;
  acme: boolean;
  leaf_certificate: string;
  certificate_chain: string;
  sha256_fingerprint: string;
  trusted: boolean;
  self_signed: boolean;
  subject_alternative_names: string[];
  private_key_algorithm: string;
  private_key: string;
  created_at: string;
  updated_at: string;
  _links: {
    account: LinkResponse;
  };
}

export const deserializeCertificate = (
  payload: DeployCertificateResponse,
): DeployCertificate => {
  const links = payload._links;

  return {
    id: payload.id.toString(),
    commonName: payload.common_name || "Unknown",
    certificateBody: payload.certificate_body,
    notBefore: payload.not_before,
    notAfter: payload.not_after,
    issuerCountry: payload.issuer_country,
    issuerOrganization: payload.issuer_organization || "Unknown Issuer",
    issuerWebsite: payload.issuer_website,
    issuerCommonName: payload.issuer_common_name,
    subjectCountry: payload.subject_country,
    subjectState: payload.subject_state,
    subjectLocale: payload.subject_locale,
    subjectOrganization: payload.subject_organization,
    acme: payload.acme,
    leafCertificate: payload.leaf_certificate,
    certificateChain: payload.certificate_chain,
    sha256Fingerprint: payload.sha256_fingerprint,
    trusted: payload.trusted,
    selfSigned: payload.self_signed,
    subjectAlternativeNames: payload.subject_alternative_names,
    privateKeyAlgorithm: payload.private_key_algorithm,
    privateKey: payload.private_key,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    environmentId: extractIdFromLink(links.account),
  };
};

export const defaultDeployCertificate = (
  c: Partial<DeployCertificate> = {},
): DeployCertificate => {
  const now = new Date().toISOString();
  return {
    id: "",
    commonName: "",
    certificateBody: "",
    notBefore: now,
    notAfter: now,
    issuerCountry: "",
    issuerOrganization: "",
    issuerWebsite: "",
    issuerCommonName: "",
    subjectCountry: "",
    subjectState: "",
    subjectLocale: "",
    subjectOrganization: "",
    acme: false,
    leafCertificate: "",
    certificateChain: "",
    sha256Fingerprint: "",
    trusted: false,
    selfSigned: true,
    subjectAlternativeNames: [],
    privateKeyAlgorithm: "",
    privateKey: "",
    createdAt: now,
    updatedAt: now,
    environmentId: "",
    ...c,
  };
};

export const DEPLOY_CERTIFICATE_NAME = "certificates";
const slice = createTable<DeployCertificate>({
  name: DEPLOY_CERTIFICATE_NAME,
});
export const { add: addDeployCertificates, remove: removeDeployCertificates } =
  slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_CERTIFICATE_NAME],
);
const initCertificate = defaultDeployCertificate();
const must = mustSelectEntity(initCertificate);
export const selectCertificateById = must(selectors.selectById);
export const { selectTableAsList: selectCertificatesAsList } = selectors;
export const hasDeployCertificate = (a: DeployCertificate) => a.id !== "";

export const selectCertificatesByEnvId = createSelector(
  selectCertificatesAsList,
  (_: AppState, props: { envId: string }) => props.envId,
  (certs, envId) => {
    return certs
      .filter((cert) => cert.environmentId === envId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  },
);

export const certificateReducers = createReducerMap(slice);

export const fetchCert = api.get<{ id: string }>("/certificates/:id");
export const cancelPollCert = createAction("cancel-poll-cert");
export const pollCert = api.get<{ id: string }>(["/certificates/:id", "poll"], {
  saga: poll(5 * 1000, `${cancelPollCert}`),
});
export const fetchAppsByCertId = api.get<{ certId: string }>(
  "/certificates/:certId/apps",
);
export const fetchEndpointsByCertId = api.get<{ certId: string }>(
  "/certificates/:certId/vhosts",
);

export const deleteCertificate = api.delete<{ certId: string }>(
  "/certificates/:certId",
);

export const fetchCertificateById = api.get<{ certId: string }>(
  "/certificates/:certId",
);

export const fetchCertificatesByEnvironmentId = api.get<
  PaginateProps & { id: string }
>("/accounts/:id/certificates?page=:page");

export const fetchAllCertsByEnvId = thunks.create<{ id: string }>(
  "fetch-all-certs-by-env",
  { saga: createThrottle(5 * 1000) },
  combinePages(fetchCertificatesByEnvironmentId),
);

export interface CreateCertProps {
  cert: string;
  privKey: string;
  envId: string;
}

export const createCertificate = api.post<
  CreateCertProps,
  DeployCertificateResponse
>("/accounts/:envId/certificates", function* (ctx, next) {
  const body = JSON.stringify({
    certificate_body: ctx.payload.cert,
    private_key: ctx.payload.privKey,
  });
  ctx.request = ctx.req({ body });
  yield* next();
});

export const certificateEntities = {
  certificate: defaultEntity({
    id: "certificate",
    deserialize: deserializeCertificate,
    save: addDeployCertificates,
  }),
};

export const getCertIssuerName = (cert: DeployCertificate) => {
  return cert.issuerOrganization || cert.issuerCommonName;
};

export const getCertFingerprint = (cert: DeployCertificate) => {
  return cert.sha256Fingerprint.slice(0, 7);
};

export const getCertLabel = (cert: DeployCertificate) => {
  const bits = [cert.commonName];
  const notBefore = cert.notBefore;
  const notAfter = cert.notAfter;
  if (notBefore && notAfter) {
    bits.push(
      `Valid: ${prettyDateTime(notBefore)} - ${prettyDateTime(notAfter)}`,
    );
  }

  const issuerName = getCertIssuerName(cert);
  if (issuerName) {
    bits.push(issuerName);
  }

  const fingerprint = getCertFingerprint(cert);
  if (fingerprint) {
    bits.push(fingerprint);
  }

  return bits.join(" - ");
};
