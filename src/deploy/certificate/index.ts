import { PaginateProps, api, combinePages, thunks } from "@app/api";
import { prettyDateTime } from "@app/date";
import { poll, takeLeading } from "@app/fx";
import { createAction, createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { DeployCertificate, LinkResponse } from "@app/types";

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
  _type: "certificate";
}

export const defaultCertificateResponse = (
  p: Partial<DeployCertificateResponse> = {},
): DeployCertificateResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    common_name: "",
    certificate_body: "",
    not_before: "",
    not_after: "",
    issuer_country: "",
    issuer_organization: "",
    issuer_website: "",
    issuer_common_name: "",
    subject_country: "",
    subject_state: "",
    subject_locale: "",
    subject_organization: "",
    acme: false,
    leaf_certificate: "",
    certificate_chain: "",
    sha256_fingerprint: "",
    trusted: false,
    self_signed: false,
    subject_alternative_names: [],
    private_key_algorithm: "",
    private_key: "",
    created_at: now,
    updated_at: now,
    _links: {
      account: defaultHalHref(),
    },
    _type: "certificate",
    ...p,
  };
};

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

export const selectCertificateById = schema.certificates.selectById;
export const selectCertificatesAsList = schema.certificates.selectTableAsList;
export const hasDeployCertificate = (a: DeployCertificate) => a.id !== "";

export const selectCertificatesByEnvId = createSelector(
  selectCertificatesAsList,
  (_: WebState, props: { envId: string }) => props.envId,
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

export const cancelPollCert = createAction("cancel-poll-cert");
export const pollCert = api.get<{ id: string }>(["/certificates/:id", "poll"], {
  supervisor: poll(5 * 1000, `${cancelPollCert}`),
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
  { supervisor: takeLeading },
  combinePages(fetchCertificatesByEnvironmentId),
);

export const removeDeployCertificates = thunks.create<string[]>(
  "remove-certs",
  function* (ctx, next) {
    yield* schema.update(schema.certificates.remove(ctx.payload));
    yield* next();
  },
);

export interface CreateCertProps {
  cert: string;
  privKey: string;
  envId: string;
}

export const createCertificate = api.post<
  CreateCertProps,
  DeployCertificateResponse,
  // TODO: shouldn't need to provide this
  { message: string }
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
    save: schema.certificates.add,
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
