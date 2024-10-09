import {
  type CreateEndpointProps,
  type EndpointManagedType,
  fetchApp,
  fetchEnvironmentById,
  fetchImageById,
  fetchStack,
  getContainerPort,
  parseIpStr,
  provisionEndpoint,
  selectAppById,
  selectEnvironmentById,
  selectImageById,
  selectStackById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { endpointDetailUrl } from "@app/routes";
import type { EndpointType } from "@app/types";
import { existValidator, ipValidator, portValidator } from "@app/validator";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  ButtonCreate,
  ButtonLinkDocs,
  CertSelector,
  CheckBox,
  CreateAppEndpointSelector,
  Form,
  FormGroup,
  Input,
  Radio,
  RadioGroup,
  Select,
  type SelectOption,
  TextArea,
} from "../shared";

const validators = {
  port: (data: CreateEndpointProps) => portValidator(data.containerPort),
  ipAllowlist: (data: CreateEndpointProps) => ipValidator(data.ipAllowlist),
  service: (data: CreateEndpointProps) =>
    existValidator(data.serviceId, "Must select a service"),
  domain: (data: CreateEndpointProps) => {
    if (data.type !== "managed") return;
    if (data.domain === "") {
      return "A domain is required for managed certificate";
    }
  },
  cert: (data: CreateEndpointProps) => {
    if (data.type !== "custom") return;
    if (data.certId === "" && data.cert === "") {
      return "A certificate is required for custom certificate";
    }
  },
  privKey: (data: CreateEndpointProps) => {
    if (data.type !== "custom") return;
    if (data.certId === "" && data.privKey === "") {
      return "A private key is required for custom certificate";
    }
  },
};

export const AppCreateEndpointPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );
  useQuery(fetchEnvironmentById({ id: app.environmentId }));
  const env = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  useQuery(fetchStack({ id: env.stackId }));
  const stack = useSelector((s) => selectStackById(s, { id: env.stackId }));

  const [serviceId, setServiceId] = useState("");
  const [port, setPort] = useState("");
  const [trType, setTrType] = useState<EndpointType>("http_proxy_protocol");
  const [enpType, setEnpType] = useState<EndpointManagedType>("default");
  const [enpPlacement, setEnpPlacement] = useState("external");
  const [ipAllowlist, setIpAllowlist] = useState("");
  const [domain, setDomain] = useState("");
  const [transCert, setTransCert] = useState(false);
  const [cert, setCert] = useState("");
  const [certId, setCertId] = useState("");
  const [privKey, setPrivKey] = useState("");
  const portText = getContainerPort(
    { containerPort: port, containerPorts: [] },
    image.exposedPorts,
  );
  const [usingNewCert, setUsingNewCert] = useState(false);

  const createData = (): CreateEndpointProps => {
    const def = {
      serviceId,
      trafficType: trType,
      internal: enpPlacement === "internal",
      ipAllowlist: parseIpStr(ipAllowlist),
      containerPort: port,
    };

    if (enpType === "managed") {
      return {
        type: "managed",
        envId: app.environmentId,
        certId: usingNewCert ? "" : certId,
        cert,
        privKey,
        domain,
        ...def,
      };
    }

    if (enpType === "custom") {
      return {
        type: "custom",
        envId: app.environmentId,
        certId: usingNewCert ? "" : certId,
        cert,
        privKey,
        ...def,
      };
    }

    return {
      type: "default",
      envId: app.environmentId,
      ...def,
    };
  };

  const [errors, validate] = useValidator<
    CreateEndpointProps,
    typeof validators
  >(validators);
  const formData = createData();
  const action = provisionEndpoint(formData);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(formData)) return;
    dispatch(action);
  };

  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
    navigate(endpointDetailUrl(loader.meta.endpointId));
  });

  const options: SelectOption[] = [
    {
      label: `Use app-${app.id}.${stack.defaultDomain} default endpoint`,
      value: "default",
    },
    { label: "Use a custom domain with Managed certificate", value: "managed" },
    { label: "Use a custom domain with a custom certificate", value: "custom" },
  ];

  const domainForm = (
    <FormGroup
      label="Domain Name"
      htmlFor="domain"
      description="You will need to be able to create a CNAME from this domain name to one provided by Aptible. Wildcard domains are supported."
      feedbackMessage={errors.domain}
      feedbackVariant={errors.domain ? "danger" : "info"}
    >
      <Input
        type="text"
        name="domain"
        value={domain}
        onChange={(e) => setDomain(e.currentTarget.value)}
      />
    </FormGroup>
  );

  const transCertForm = (
    <FormGroup
      label="Transitional Certificate"
      htmlFor="trans-cert"
      description="Managed certificate provisions a certificate for you, but this process takes a little while. During this time, your application will be unavailable. If you need to avoid downtime, you can provide a transitional certificate, which will let Aptible provision your Managed certificate in the background, while your app is running."
    >
      <CheckBox
        label="Use a transitional certificate (recommended if your application is already live)"
        name="trans-cert"
        checked={transCert}
        onChange={(e) => setTransCert(e.currentTarget.checked)}
      />
    </FormGroup>
  );

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

  const enpPlacementForm = (
    <FormGroup label="Endpoint Placement" htmlFor="endpoint-placement">
      <RadioGroup
        name="endpoint-placement"
        selected={enpPlacement}
        onSelect={setEnpPlacement}
      >
        <Radio value="external">External</Radio>
        <Radio value="internal">Internal</Radio>
      </RadioGroup>
    </FormGroup>
  );

  const ipAllowlistForm = (
    <FormGroup
      label="IP Allowlist"
      htmlFor="ip-allowlist"
      description="Only traffic from the following sources is allowed. Add more sources (IPv4 addresses and CIDRs) by separating them with spaces or newlines."
      feedbackMessage={errors.ipAllowlist}
      feedbackVariant={errors.ipAllowlist ? "danger" : "info"}
    >
      <TextArea
        id="ip-allowlist"
        aria-label="ip-allowlist"
        value={ipAllowlist}
        onChange={(e) => setIpAllowlist(e.currentTarget.value)}
      />
    </FormGroup>
  );

  const getProtocolName = (trafficType: EndpointType) => {
    switch (trafficType) {
      case "grpc":
        return "gRPC";
      case "http_proxy_protocol":
        return "HTTP";
      default:
        return "HTTP";
    }
  };

  const form = () => {
    if (enpType === "managed") {
      return (
        <>
          {enpPlacementForm}
          {domainForm}
          {transCertForm}
          {transCert ? certSelectorForm : null}
          {transCert && usingNewCert ? certForm : null}
          {transCert && usingNewCert ? privKeyForm : null}
          {ipAllowlistForm}
        </>
      );
    }

    if (enpType === "custom") {
      return (
        <>
          {enpPlacementForm}
          {certSelectorForm}
          {usingNewCert ? certForm : null}
          {usingNewCert ? privKeyForm : null}
          {ipAllowlistForm}
        </>
      );
    }
    return (
      <>
        {enpPlacementForm}
        {ipAllowlistForm}
      </>
    );
  };

  return (
    <Box>
      <div className="flex justify-between items-start">
        <h1 className="text-lg text-black font-semibold">Create Endpoint</h1>
        <ButtonLinkDocs href="https://www.aptible.com/docs/core-concepts/apps/connecting-to-apps/app-endpoints/overview" />
      </div>
      <div className="mt-2 mb-4 text-black-900">
        This Endpoint will accept{" "}
        {getProtocolName(trType) === "HTTP"
          ? "HTTP and HTTPS"
          : getProtocolName(trType)}{" "}
        traffic and route it to your app over {getProtocolName(trType)}.
      </div>
      <Form onSubmit={onSubmit}>
        <FormGroup label="Traffic Type" htmlFor="traffic-type">
          <RadioGroup
            name="traffic-type"
            selected={trType}
            onSelect={setTrType}
          >
            <Radio value="http_proxy_protocol">HTTP</Radio>
            <Radio value="grpc">gRPC</Radio>
          </RadioGroup>
        </FormGroup>
        <FormGroup
          label="Service"
          htmlFor="service"
          feedbackMessage={errors.service}
          feedbackVariant={errors.service ? "danger" : "info"}
        >
          <CreateAppEndpointSelector
            app={app}
            selectedId={serviceId}
            onSelect={setServiceId}
          />
        </FormGroup>

        <FormGroup
          label="Custom Container Port"
          htmlFor="port"
          description={`Aptible will deliver ${getProtocolName(trType)} traffic to your app on port (${portText}).`}
          feedbackMessage={errors.port}
          feedbackVariant={errors.port ? "danger" : "info"}
        >
          <Input
            id="port"
            name="port"
            type="text"
            value={port}
            onChange={(e) => setPort(e.currentTarget.value)}
          />
          <div className="text-base text-black-500 pt-2">
            Choose any port number between 1 and 65535. Your app must be
            listening for {getProtocolName(trType)} traffic on this port, and it
            must be exposed by your Docker image.
          </div>
        </FormGroup>

        <FormGroup label="Endpoint Type" htmlFor="endpoint-type">
          <Select
            ariaLabel="Endpoint Type"
            id="endpoint-type"
            options={options}
            onSelect={(opt) => setEnpType(opt.value as EndpointManagedType)}
            value={enpType}
          />
        </FormGroup>

        {form()}

        <BannerMessages {...loader} />

        <ButtonCreate
          envId={app.environmentId}
          isLoading={loader.isLoading}
          type="submit"
          className="w-[200px]"
        >
          Save Endpoint
        </ButtonCreate>
      </Form>
    </Box>
  );
};
