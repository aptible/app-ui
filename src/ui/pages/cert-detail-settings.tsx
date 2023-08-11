import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useLoader, useLoaderSuccess, useQuery } from "saga-query/react";

import {
  deleteCertificate,
  fetchEndpointsByCertId,
  removeDeployCertificates,
  selectCertificateById,
  selectEndpointsByCertificateId,
} from "@app/deploy";
import { environmentCertificatesUrl } from "@app/routes";
import { AppState } from "@app/types";

import {
  Banner,
  BannerMessages,
  Box,
  ButtonDestroy,
  IconAlertTriangle,
  IconTrash,
  Input,
} from "../shared";

const CertDelete = ({ certId }: { certId: string }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useQuery(fetchEndpointsByCertId({ certId }));
  const cert = useSelector((s: AppState) =>
    selectCertificateById(s, { id: certId }),
  );
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByCertificateId(s, {
      certificateId: certId,
      envId: cert.environmentId,
    }),
  );

  const action = deleteCertificate({ certId });
  const loader = useLoader(action);
  const [confirm, setConfirm] = useState("");

  useLoaderSuccess(loader, () => {
    dispatch(removeDeployCertificates([certId]));
    navigate(environmentCertificatesUrl(cert.environmentId));
  });
  const invalid = endpoints.length > 0 || confirm !== cert.commonName;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (invalid) return;
    dispatch(action);
  };

  return (
    <Box className="mb-8">
      <h1 className="text-lg text-red-500 font-semibold">
        <IconAlertTriangle
          className="inline pr-3 mb-1"
          style={{ width: 32 }}
          color="#AD1A1A"
        />
        Delete Certificate
      </h1>
      <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
        {endpoints.length > 0 ? (
          <Banner variant="error">
            This certificate is still in use and cannot be deleted. Remove all
            endpoints before trying again.
          </Banner>
        ) : null}

        <p>
          This will permanently delete <strong>{cert.commonName}</strong>{" "}
          certificate. This action cannot be undone. If you want to proceed,
          type <strong>{cert.commonName}</strong> below to continue.
        </p>

        <BannerMessages {...loader} />

        <div className="flex">
          <Input
            className="flex-1"
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            id="delete-confirm"
          />
          <ButtonDestroy
            type="submit"
            envId={cert.environmentId}
            variant="delete"
            isLoading={loader.isLoading}
            disabled={invalid}
            className="h-15 w-60 mb-0 ml-4 flex"
          >
            <IconTrash color="#FFF" className="mr-2" />
            Delete Certificate
          </ButtonDestroy>
        </div>
      </form>
    </Box>
  );
};

export const CertDetailSettingsPage = () => {
  const { id = "" } = useParams();
  return <CertDelete certId={id} />;
};
