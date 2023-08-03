import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  CreateEndpointProps,
  EndpointType,
  fetchApp,
  parseIpStr,
  provisionEndpoint,
  selectAppById,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { endpointDetailUrl } from "@app/routes";
import { AppState } from "@app/types";

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
  TextArea,
} from "../shared";
import { ipValidator, portValidator } from "@app/validator";

const validators = {
  port: (data: CreateEndpointProps) => portValidator(data.containerPort),
  ipAllowlist: (data: CreateEndpointProps) => ipValidator(data.ipAllowlist),
  domain: (data: CreateEndpointProps) => {
    if (data.type !== "managed") return;
    if (data.domain === "") {
      return "A domain is required for managed HTTPS";
    }
  },
  cert: (data: CreateEndpointProps) => {
    if (data.type !== "custom") return;
    if (data.cert === "") {
      return "A certificate is required for custom HTTPS";
    }
  },
  privKey: (data: CreateEndpointProps) => {
    if (data.type !== "custom") return;
    if (data.privKey === "") {
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
  const [privKey, setPrivKey] = useState("");

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
        cert,
        privKey,
        domain,
        ...def,
      };
    }

    if (enpType === "custom") {
      return {
        type: "custom",
        cert,
        privKey,
        ...def,
      };
    }

    return {
      type: "default",
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

  return (
    <div className="bg-white py-10 px-10 shadow border border-black-100 rounded-lg">
      <h1 className="text-lg text-black font-semibold">Create Endpoint</h1>
      <div className="mt-2 mb-4 text-black-500">
        This Endpoint will accept HTTP and HTTPS traffic and route it to your
        app over HTTP.
      </div>
      <Form onSubmit={onSubmit}>
        <FormGroup label="Service" htmlFor="service">
          <CreateAppEndpointSelector
            app={app}
            selectedId={serviceId}
            onSelect={setServiceId}
          />
        </FormGroup>

        <FormGroup
          label="Custom Container Port"
          htmlFor="port"
          description="Deploy will deliver HTTP traffic to your app on port 80."
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
          <RadioGroup
            name="endpoint-type"
            selected={enpType}
            onSelect={setEnpType}
          >
            <Radio value="default">
              Use app-{app.id}.on-aptible.com default endpoint.
            </Radio>
            <Radio value="managed">
              Use a custom domain with Managed HTTPS.
            </Radio>
            <Radio value="custom">
              Use a custom domain with a custom certificate.
            </Radio>
          </RadioGroup>
        </FormGroup>

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

        <FormGroup
          htmlFor="cert"
          label="Certificate"
          feedbackMessage={errors.cert}
          feedbackVariant={errors.cert ? "danger" : "info"}
          description={
            <>
              <p>
                Drag and drop your certificate file or paste its contents in the
                textarea below.
              </p>
              <p>
                If you have a bundled certificate chain, drag and drop all of
                the certificate files or paste their contents in the textarea
                below.
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

        <FormGroup
          htmlFor="private-key"
          label="Private Key"
          description="Drag and drop your private key file or paste its contents in the textarea below."
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
