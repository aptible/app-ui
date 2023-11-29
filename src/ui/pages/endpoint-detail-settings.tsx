import {
  EndpointUpdateProps,
  fetchImageById,
  getContainerPort,
  isRequiresCert,
  parseIpStr,
  selectAppById,
  selectEndpointById,
  selectImageById,
  selectServiceById,
  updateEndpoint,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { endpointDetailActivityUrl } from "@app/routes";
import { AppState } from "@app/types";
import { ipValidator, portValidator } from "@app/validator";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  ButtonCreate,
  CertSelector,
  CheckBox,
  EndpointDeprovision,
  FormGroup,
  Group,
  Input,
  TextArea,
} from "../shared";

const validators = {
  port: (data: EndpointUpdateProps) => portValidator(data.containerPort),
  ipAllowlist: (data: EndpointUpdateProps) => ipValidator(data.ipAllowlist),
  cert: (data: EndpointUpdateProps) => {
    if (data.requiresCert && data.certId === "" && data.cert === "") {
      return "A certificate is required for custom HTTPS";
    }
  },
  privKey: (data: EndpointUpdateProps) => {
    if (data.requiresCert && data.certId === "" && data.privKey === "") {
      return "A private key is required for custom HTTPS";
    }
  },
};

const EndpointSettings = ({ endpointId }: { endpointId: string }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const enp = useSelector((s: AppState) =>
    selectEndpointById(s, { id: endpointId }),
  );
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: enp.serviceId }),
  );
  const app = useSelector((s: AppState) =>
    selectAppById(s, { id: service.appId }),
  );
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s: AppState) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  const exposedPorts = image.exposedPorts;

  const origAllowlist = enp.ipWhitelist.join("\n");
  const [ipAllowlist, setIpAllowlist] = useState(origAllowlist);
  const [port, setPort] = useState(enp.containerPort);
  const [certId, setCertId] = useState(enp.certificateId);
  const [cert, setCert] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [usingNewCert, setUsingNewCert] = useState(false);

  useEffect(() => {
    setIpAllowlist(origAllowlist);
  }, [origAllowlist]);
  useEffect(() => {
    setPort(enp.containerPort);
  }, [enp.containerPort]);
  useEffect(() => {
    setCertId(enp.certificateId);
  }, [enp.certificateId]);

  const data = {
    id: endpointId,
    ipAllowlist: parseIpStr(ipAllowlist),
    containerPort: port,
    certId,
    envId: service.environmentId,
    cert,
    privKey,
    requiresCert: isRequiresCert(enp),
  };
  const ipsSame = origAllowlist === ipAllowlist;
  const portSame = enp.containerPort === port;
  const certSame = enp.certificateId === certId;
  const isDisabled = ipsSame && portSame && certSame && cert === "";
  const curPortText = getContainerPort(enp, exposedPorts);
  const loader = useLoader(updateEndpoint);
  const [errors, validate] = useValidator<
    EndpointUpdateProps,
    typeof validators
  >(validators);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDisabled) return;
    if (!validate(data)) return;
    dispatch(updateEndpoint(data));
  };

  useLoaderSuccess(loader, () => {
    navigate(endpointDetailActivityUrl(endpointId));
  });

  const certSelectorForm = (
    <FormGroup
      htmlFor="existing-cert"
      label="Certificate"
      feedbackMessage={errors.cert}
      feedbackVariant={errors.cert ? "danger" : "info"}
    >
      {usingNewCert ? null : (
        <CertSelector
          envId={app.environmentId}
          selectedId={certId}
          onSelect={(opt) => setCertId(opt.value)}
          className="mb-2"
        />
      )}
      <CheckBox
        label="Create a New Certificate"
        name="new-cert"
        checked={usingNewCert}
        onChange={(e) => setUsingNewCert(e.currentTarget.checked)}
      />
    </FormGroup>
  );

  const certForm = (
    <FormGroup
      htmlFor="cert"
      label="New Certificate"
      feedbackMessage={errors.cert}
      feedbackVariant={errors.cert ? "danger" : "info"}
      description={
        <>
          <p>Paste its contents in the textarea below.</p>
          <p>
            If you have a bundled certificate chain, drag and drop all of the
            certificate files or paste their contents in the textarea below.
          </p>
        </>
      }
    >
      <TextArea
        id="cert"
        aria-label="cert"
        onChange={(e) => setCert(e.currentTarget.value)}
        value={cert}
      />
    </FormGroup>
  );

  const privKeyForm = (
    <FormGroup
      htmlFor="private-key"
      label="Private Key for New Certificate"
      description="Paste its contents in the textarea below."
      feedbackMessage={errors.privKey}
      feedbackVariant={errors.privKey ? "danger" : "info"}
    >
      <TextArea
        id="private-key"
        aria-label="private-key"
        onChange={(e) => setPrivKey(e.currentTarget.value)}
        value={privKey}
      />
    </FormGroup>
  );

  const certEditForm =
    service.appId && data.requiresCert ? (
      <>
        {certSelectorForm}
        {certForm}
        {privKeyForm}
      </>
    ) : null;

  const portForm = service.appId ? (
    <FormGroup
      label="Container Port"
      description={`Current container port: ${curPortText}`}
      htmlFor="port"
      feedbackMessage={errors.port}
      feedbackVariant={errors.port ? "danger" : "info"}
    >
      <Input
        type="text"
        id="port"
        name="port"
        value={port}
        onChange={(e) => setPort(e.currentTarget.value)}
      />
    </FormGroup>
  ) : null;

  return (
    <Box>
      <h1 className="text-lg text-gray-500 mb-4">Endpoint Settings</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <BannerMessages {...loader} />

        {portForm}
        {certEditForm}

        <FormGroup
          label="IP Allowlist"
          htmlFor="ip-allowlist"
          feedbackMessage={errors.ipAllowlist}
          feedbackVariant={errors.ipAllowlist ? "danger" : "info"}
        >
          <TextArea
            id="ip-allowlist"
            name="ip-allowlist"
            value={ipAllowlist}
            onChange={(e) => setIpAllowlist(e.currentTarget.value)}
          />
        </FormGroup>

        <ButtonCreate
          type="submit"
          envId={service.environmentId}
          isLoading={loader.isLoading}
          className="w-40"
          disabled={isDisabled}
        >
          Save Changes
        </ButtonCreate>
      </form>
    </Box>
  );
};

export const EndpointDetailSettingsPage = () => {
  const { id = "" } = useParams();
  const enp = useSelector((s: AppState) => selectEndpointById(s, { id }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: enp.serviceId }),
  );

  return (
    <Group variant="vertical" size="lg">
      <EndpointSettings endpointId={id} />
      <EndpointDeprovision endpointId={id} envId={service.environmentId} />
    </Group>
  );
};
