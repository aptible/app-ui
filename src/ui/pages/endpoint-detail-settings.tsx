import {
  type EndpointUpdateProps,
  fetchImageById,
  getContainerPort,
  isRequiresCert,
  isTlsOrTcp,
  parseIpStr,
  parsePortsStrToNum,
  selectAppById,
  selectEndpointById,
  selectImageById,
  selectServiceById,
  updateEndpoint,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { endpointDetailActivityUrl } from "@app/routes";
import { ipValidator, portValidator } from "@app/validator";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useValidator } from "../hooks";
import {
  Banner,
  Box,
  ButtonCreate,
  CertSelector,
  CheckBox,
  EndpointDeprovision,
  FormGroup,
  Group,
  Input,
  TextArea,
  BannerMessages,
} from "../shared";

const validators = {
  port: (data: EndpointUpdateProps) => {
    if (data.enpType !== "tls" && data.enpType !== "tcp") {
      return portValidator(data.containerPort);
    }
  },
  ports: (data: EndpointUpdateProps) => {
    if (data.enpType === "tls" || data.enpType === "tcp") {
      const errs: string[] = [];
      data.containerPorts.forEach((port) => {
        const result = portValidator(port.toString());
        if (result) errs.push(`[${port}] is not between 1 and 65535`);
      });
      if (errs.length === 0) return;
      return errs.join(", ");
    }
  },
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
  const enp = useSelector((s) => selectEndpointById(s, { id: endpointId }));
  const service = useSelector((s) =>
    selectServiceById(s, { id: enp.serviceId }),
  );
  const app = useSelector((s) => selectAppById(s, { id: service.appId }));
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  const exposedPorts = image.exposedPorts;
  const origAllowlist = enp.ipWhitelist.join("\n");
  const origContainerPorts = enp.containerPorts.join(", ");
  const [ipAllowlist, setIpAllowlist] = useState(origAllowlist);
  const [port, setPort] = useState(enp.containerPort);
  const [ports, setPorts] = useState(origContainerPorts);
  const [certId, setCertId] = useState(enp.certificateId);
  const [cert, setCert] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [tokenHeader, setTokenHeader] = useState(
    enp.tokenHeader as string | undefined,
  );
  const [usingNewCert, setUsingNewCert] = useState(false);

  useEffect(() => {
    setIpAllowlist(origAllowlist);
  }, [origAllowlist]);
  useEffect(() => {
    setPort(enp.containerPort);
  }, [enp.containerPort]);
  useEffect(() => {
    setPorts(origContainerPorts);
  }, [origContainerPorts]);
  useEffect(() => {
    setCertId(enp.certificateId);
  }, [enp.certificateId]);

  const data = {
    id: endpointId,
    ipAllowlist: parseIpStr(ipAllowlist),
    containerPort: port,
    containerPorts: parsePortsStrToNum(ports),
    certId,
    envId: service.environmentId,
    cert,
    privKey,
    tokenHeader,
    requiresCert: isRequiresCert(enp),
    enpType: enp.type,
  };
  const ipsSame = origAllowlist === ipAllowlist;
  const portSame = enp.containerPort === port;
  const portsSame = origContainerPorts === ports;
  const certSame = enp.certificateId === certId;
  const tokenSame = enp.tokenHeader === tokenHeader;
  const isDisabled =
    ipsSame && portSame && portsSame && certSame && cert === "" && tokenSame;
  const curPortText = getContainerPort(enp, exposedPorts);
  // Create an instance of the action with the specific data to track the right loader
  const updateAction = updateEndpoint(data);
  const loader = useLoader(updateAction);
  const [errors, validate] = useValidator<
    EndpointUpdateProps,
    typeof validators
  >(validators);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDisabled) return;
    if (!validate(data)) return;
    dispatch(updateAction);
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
        onChange={(e) => {
          // must remove certId for `updateEndpoint`
          setCertId("");
          setUsingNewCert(e.currentTarget.checked);
        }}
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
    isTlsOrTcp(enp) ? (
      <FormGroup
        label="Container Ports"
        description={`Current container ports: ${curPortText}`}
        htmlFor="ports"
        feedbackMessage={errors.ports}
        feedbackVariant={errors.ports ? "danger" : "info"}
      >
        <Input
          type="text"
          id="ports"
          name="ports"
          value={ports}
          onChange={(e) => setPorts(e.currentTarget.value)}
        />
      </FormGroup>
    ) : (
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
    )
  ) : null;

  const tokenEditForm =
    data.enpType === "http" ||
    data.enpType === "http_proxy_protocol" ||
    data.enpType === "grpc" ? (
      <FormGroup
        label="Header Authentication Value"
        htmlFor="token-header"
        description={`The 'X-Origin-Token' header value. When set, clients will be required to pass a 
          'X-Origin-Token' header matching this value. Token header may only contain letters, numbers, 
          '_', '-', ':', and '.'`}
      >
        <Input
          type="text"
          id="token-header"
          name="token-header"
          value={tokenHeader}
          onChange={(e) => setTokenHeader(e.currentTarget.value)}
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
        {tokenEditForm}

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
  const enp = useSelector((s) => selectEndpointById(s, { id }));
  const service = useSelector((s) =>
    selectServiceById(s, { id: enp.serviceId }),
  );

  return (
    <Group variant="vertical" size="lg">
      <EndpointSettings endpointId={id} />
      <EndpointDeprovision endpointId={id} envId={service.environmentId} />
    </Group>
  );
};
