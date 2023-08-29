import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useLoader, useLoaderSuccess } from "saga-query/react";

import {
  EndpointUpdateProps,
  parseIpStr,
  selectEndpointById,
  selectServiceById,
  updateEndpoint,
} from "@app/deploy";
import { endpointDetailActivityUrl } from "@app/routes";
import { AppState } from "@app/types";

import { ipValidator, portValidator } from "@app/validator";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  ButtonCreate,
  EndpointDeprovision,
  FormGroup,
  Group,
  Input,
  TextArea,
} from "../shared";

const validators = {
  port: (data: EndpointUpdateProps) => portValidator(data.containerPort),
  ipAllowlist: (data: EndpointUpdateProps) => ipValidator(data.ipAllowlist),
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
  const [ipAllowlist, setIpAllowlist] = useState(enp.ipWhitelist.join("\n"));
  const [port, setPort] = useState(enp.containerPort);
  useEffect(() => {
    setIpAllowlist(enp.ipWhitelist.join("\n"));
  }, [enp.ipWhitelist]);
  useEffect(() => {
    setPort(enp.containerPort);
  }, [enp.containerPort]);
  const data = {
    id: endpointId,
    ipAllowlist: parseIpStr(ipAllowlist),
    containerPort: port,
  };
  const action = updateEndpoint(data);
  const loader = useLoader(action);
  const [errors, validate] = useValidator<
    EndpointUpdateProps,
    typeof validators
  >(validators);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };
  useLoaderSuccess(loader, () => {
    navigate(endpointDetailActivityUrl(endpointId));
  });

  return (
    <Box>
      <h1 className="text-lg text-gray-500 mb-4">Endpoint Settings</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormGroup
          label="Container Port"
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

        <BannerMessages {...loader} />

        <ButtonCreate
          type="submit"
          envId={service.environmentId}
          isLoading={loader.isLoading}
          className="w-40"
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
