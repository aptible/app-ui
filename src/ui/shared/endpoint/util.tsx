import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useLoader, useLoaderSuccess } from "saga-query/react";

import {
  deprovisionEndpoint,
  getEndpointUrl,
  selectEndpointById,
} from "@app/deploy";
import { operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { AppState, DeployEndpoint, ProvisionableStatus } from "@app/types";

import { useState } from "react";
import { Box } from "../box";
import { ButtonDestroy } from "../button";
import { ExternalLink } from "../external-link";
import {
  IconAlertTriangle,
  IconCheck,
  IconInfo,
  IconSettings,
  IconTrash,
  IconX,
} from "../icons";
import { Input } from "../input";

export const EndpointStatusPill = ({
  status,
}: {
  status: ProvisionableStatus;
}) => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  if (
    status === "provisioning" ||
    status === "deprovisioning" ||
    status === "pending"
  ) {
    return (
      <div className={cn(className, "text-brown border-brown bg-orange-100")}>
        <IconSettings color="#825804" className="mr-1" variant="sm" />
        <div>{capitalize(status)}</div>
      </div>
    );
  }

  if (status === "deprovision_failed" || status === "provision_failed") {
    return (
      <div className={cn(className, "text-red border-red-300 bg-red-100")}>
        <IconX color="#AD1A1A" variant="sm" />
        <div> {capitalize(status.replace("_", " "))}</div>
      </div>
    );
  }

  if (status === "provisioned") {
    return (
      <div className={cn(className, "text-forest border-lime-300 bg-lime-100")}>
        <IconCheck color="#00633F" className="mr-1" variant="sm" />
        Provisioned
      </div>
    );
  }

  return (
    <div
      className={cn(className, "text-indigo border-indigo-300 bg-indigo-100")}
    >
      <IconInfo color="#4361FF" className="mr-1" variant="sm" />
      Unknown
    </div>
  );
};

export function EndpointUrl({ enp }: { enp: DeployEndpoint }) {
  if (enp.status === "provisioning") {
    return <p className="text-gray-500 italic">Provisioning</p>;
  }

  if (enp.type === "tcp") {
    return <span>{enp.externalHost}</span>;
  }

  return (
    <ExternalLink
      className="text-black group-hover:text-indigo hover:text-indigo"
      href={`https://${enp.virtualDomain}`}
      variant="default"
    >
      https://{enp.virtualDomain}
    </ExternalLink>
  );
}

export const EndpointDeprovision = ({
  envId,
  endpointId,
}: { endpointId: string; envId: string }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const action = deprovisionEndpoint({ id: endpointId });
  const loader = useLoader(action);
  const [confirm, setConfirm] = useState("");
  useLoaderSuccess(loader, () => {
    navigate(operationDetailUrl(loader.meta.opId));
  });
  const enp = useSelector((s: AppState) =>
    selectEndpointById(s, { id: endpointId }),
  );
  const url = getEndpointUrl(enp);
  const invalid = confirm !== url;

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
        Deprovision Endpoint
      </h1>
      <form className="mt-2" onSubmit={onSubmit}>
        <p>
          This will permanently deprovision <strong>{url}</strong> endpoint.
          This action cannot be undone. If you want to proceed, type the{" "}
          <strong>{url}</strong> below to continue.
        </p>
        <div className="flex mt-4">
          <Input
            className="flex-1"
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            id="delete-confirm"
          />
          <ButtonDestroy
            type="submit"
            envId={envId}
            variant="delete"
            isLoading={loader.isLoading}
            disabled={invalid}
            className="h-15 w-60 mb-0 ml-4 flex"
          >
            <IconTrash color="#FFF" className="mr-2" />
            Deprovision Endpoint
          </ButtonDestroy>
        </div>
      </form>
    </Box>
  );
};
