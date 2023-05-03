import { selectDeploy } from "../slice";
import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployCertificate } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export const deserializeCertificate = (payload: any): DeployCertificate => {
  const links = payload._links;

  return {
    id: payload.id,
    commonName: payload.common_name,
    certificateBody: payload.certificate_body,
    notBefore: payload.not_before,
    notAfter: payload.not_after,
    issuerCountry: payload.issuer_country,
    issuerOrganization: payload.issuer_organization,
    issuerWebsite: payload.issuer_website,
    issuerCommonName: payload.issuer_common_name,
    subjectCountry: payload.subject_country,
    subjectState: payload.subject_state,
    subjectLocale: payload.subject_locale,
    subjectOrganization: payload.subject_organization,
    acme: payload.acme,
    leafCertificate: payload.leaf_certificate,
    certificateChain: payload.certificate_chain,
    sha256Fingerprint: payload.sha_256_fingerprint,
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
const { add: addDeployCertificates } = slice.actions;
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
    return certs.filter((cert) => cert.environmentId === envId);
  },
);

export const certificateReducers = createReducerMap(slice);

export const fetchCertificates = api.get<{ id: string }>(
  "/accounts/:id/certificates",
);

export const certificateEntities = {
  certificate: defaultEntity({
    id: "certificate",
    deserialize: deserializeCertificate,
    save: addDeployCertificates,
  }),
};
