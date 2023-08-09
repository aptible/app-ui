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

import { ButtonDestroy } from "../button";
import { ExternalLink } from "../external-link";
import { FormGroup } from "../form-group";
import { IconCheck, IconInfo, IconSettings, IconX } from "../icons";
import { Input } from "../input";
import { useState } from "react";

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
    <ExternalLink href={`https://${enp.virtualDomain}`} variant="default">
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        In order to delete this endpoint, you must type the name of the URL{" "}
        <span className="font-bold">{url}</span>
      </div>

      <FormGroup label="Confirm Delete" htmlFor="confirm-delete">
        <Input
          id="confirm-delete"
          value={confirm}
          onChange={(e) => setConfirm(e.currentTarget.value)}
        />
      </FormGroup>

      <hr />

      <ButtonDestroy
        type="submit"
        envId={envId}
        variant="delete"
        isLoading={loader.isLoading}
        disabled={invalid}
      >
        Deprovision
      </ButtonDestroy>
    </form>
  );
};
