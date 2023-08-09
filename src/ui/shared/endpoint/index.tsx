import cn from "classnames";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useLoader, useLoaderSuccess } from "saga-query/react";

import { deprovisionEndpoint } from "@app/deploy";
import { operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { DeployEndpoint, ProvisionableStatus } from "@app/types";

import { ButtonDestroy } from "../button";
import { ExternalLink } from "../external-link";
import { IconCheck, IconInfo, IconSettings, IconX } from "../icons";

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
  const onClick = () => {
    dispatch(action);
  };
  useLoaderSuccess(loader, () => {
    navigate(operationDetailUrl(loader.meta.opId));
  });

  return (
    <ButtonDestroy
      envId={envId}
      variant="delete"
      onClick={onClick}
      isLoading={loader.isLoading}
    >
      Deprovision
    </ButtonDestroy>
  );
};
