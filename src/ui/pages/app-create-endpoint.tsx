import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  CreateEndpointProps,
  EndpointType,
  fetchAllCertsByEnvId,
  fetchApp,
  getCertLabel,
  getContainerPort,
  parseIpStr,
  provisionEndpoint,
  selectAppById,
  selectCertificatesByEnvId,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { endpointDetailUrl } from "@app/routes";
import { AppState } from "@app/types";
import { existValidtor, ipValidator, portValidator } from "@app/validator";

import { useValidator } from "../hooks";
import {
  BannerMessages,
  ButtonCreate,
  CheckBox,
  CreateAppEndpointSelector,
  Form,
  FormGroup,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  TextArea,
} from "../shared";

const CertSelector = ({
  envId,
  onSelect,
  selectedId,
  className = "",
}: {
  envId: string;
  onSelect: (opt: SelectOption) => void;
  selectedId: string;
  className?: string;
}) => {
  useQuery(fetchAllCertsByEnvId({ id: envId }));
  const certs = useSelector((s: AppState) =>
    selectCertificatesByEnvId(s, { envId }),
  );
  const options: SelectOption[] = [
    { label: "Select an Existing Certificate", value: "" },
  ];
  certs.forEach((cert) => {
    options.push({ label: getCertLabel(cert), value: cert.id });
  });

  return (
    <Select
      id="existing-cert"
      ariaLabel="existing-cert"
      options={options}
      onSelect={onSelect}
      value={selectedId}
      className={className}
    />
  );
};

const validators = {
  port: (data: CreateEndpointProps) => portValidator(data.containerPort),
  ipAllowlist: (data: CreateEndpointProps) => ipValidator(data.ipAllowlist),
  service: (data: CreateEndpointProps) =>
    existValidtor(data.serviceId, "Must select a service"),
  domain: (data: CreateEndpointProps) => {
    if (data.type !== "managed") return;
    if (data.domain === "") {
      return "A domain is required for managed HTTPS";
    }
  },
  cert: (data: CreateEndpointProps) => {
    if (data.type !== "custom") return;
    if (data.certId === "" && data.cert === "") {
      return "A certificate is required for custom HTTPS";
    }
  },
  privKey: (data: CreateEndpointProps) => {
    if (data.type !== "custom") return;
    if (data.certId === "" && data.privKey === "") {
      return "A private key is required for custom HTTPS";
    }
  },
};

export const AppCreateEndpointPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  const [serviceId, setServiceId] = useState("");
  const [port, setPort] = useState("");
  const [enpType, setEnpType] = useState<EndpointType>("default");
  const [enpPlacement, setEnpPlacement] = useState("external");
  const [ipAllowlist, setIpAllowlist] = useState("");
  const [domain, setDomain] = useState("");
  const [transCert, setTransCert] = useState(false);
  const [cert, setCert] = useState("");
  const [certId, setCertId] = useState("");
  const [privKey, setPrivKey] = useState("");
  const portText = getContainerPort(
    { containerPort: port },
    app.currentImage.exposedPorts,
  );
  const [usingNewCert, setUsingNewCert] = useState(false);

  const createData = (): CreateEndpointProps => {
    const def = {
      serviceId,
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
      label: `Use app-${app.id}.on-aptible.com default endpoint`,
      value: "default",
    },
    { label: "Use a custom domain with Managed HTTPS", value: "managed" },
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
      description="Managed HTTPS provisions a certificate for you, but this process takes a little while. During this time, your application will be unavailable. If you need to avoid downtime, you can provide a transitional certificate, which will let Aptible provision your Managed HTTPS certificate in the background, while your app is running."
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
    <div className="bg-white py-8 px-8 shadow border border-black-100 rounded-lg">
      <h1 className="text-lg text-black font-semibold">Create Endpoint</h1>
      <div className="mt-2 mb-4 text-black-500">
        This Endpoint will accept HTTP and HTTPS traffic and route it to your
        app over HTTP.
      </div>
      <Form onSubmit={onSubmit}>
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
          description={`Deploy will deliver HTTP traffic to your app on port (${portText}).`}
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
          <div className="text-sm">
            Choose any port number between 1 and 65535. Your app must be
            listening for HTTP traffic on this port, and it must be exposed by
            your Docker image.
          </div>
        </FormGroup>

        <FormGroup label="Endpoint Type" htmlFor="endpoint-type">
          <Select
            ariaLabel="Type"
            id="endpoint-type"
            options={options}
            onSelect={(opt) => setEnpType(opt.value as EndpointType)}
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
    </div>
  );
};
