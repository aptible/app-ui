import { DeployEndpoint, ProvisionableStatus } from "@app/types";
import cn from "classnames";

import { Box } from "./box";
import { ButtonIcon } from "./button";
import {
  IconArrowRight,
  IconCheck,
  IconEllipsis,
  IconInfo,
  IconSettings,
  IconX,
} from "./icons";
import { InputSearch } from "./input";
import { EmptyResultView } from "./resource-list-view";
import { ReactElement, useState } from "react";

import { capitalize } from "@app/string-utils";

const EndpointStatusPill = ({
  status,
}: {
  status: ProvisionableStatus;
}): ReactElement => {
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

const EndpointListing = ({
  endpoint,
  parent,
}: { endpoint: DeployEndpoint; parent: string }) => (
  <div className="mx-auto w-full py-2">
    <Box>
      <div className="flex">
        <EndpointStatusPill status={endpoint.status} />
        {endpoint.status === "provisioning" ? null : (
          <span className="flex ml-4 text-gray-500 text-md">
            {parent}
            <IconArrowRight
              className="inline mx-2 mt-1"
              color="#6b7280"
              style={{ height: 18, width: 18 }}
            />
            {endpoint.type === "tcp"
              ? endpoint.externalHost
              : endpoint.virtualDomain}
          </span>
        )}
      </div>
      <div className="flex">
        <div className="flex-col w-1/2">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Hostname</h3>
            {endpoint.status === "provisioning" ? (
              <p className="text-gray-500 italic">Provisioning</p>
            ) : endpoint.type === "tcp" ? (
              endpoint.externalHost
            ) : (
              <p>
                <a
                  href={`https://${endpoint.virtualDomain}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://{endpoint.virtualDomain}
                </a>
              </p>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Placement</h3>
            <p>
              {endpoint.externalHost
                ? "External (publicly accessible)"
                : "Internal"}
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Platform</h3>
            <p>{endpoint.platform.toLocaleUpperCase()}</p>
          </div>
        </div>
        <div className="flex-col w-1/2">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              IP Filtering
            </h3>
            <p>
              {endpoint.ipWhitelist.length
                ? endpoint.ipWhitelist.join(", ")
                : "Disabled"}
            </p>
          </div>
        </div>
      </div>
    </Box>
  </div>
);

const EndpointsOverview = ({
  endpoints,
  parent,
}: {
  endpoints: DeployEndpoint[];
  parent: string;
}): ReactElement => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <div className="mb-4">
      <div className="flex justify-between w-100">
        <div className="flex w-1/2">
          {/* <ButtonIcon icon={<IconPlusCircle />}>New Endpoint</ButtonIcon> */}
        </div>
        <div className="flex w-1/2 justify-end">
          {endpoints.length ? (
            <InputSearch
              className="self-end float-right]"
              placeholder="Search endpoints..."
              search={search}
              onChange={onChange}
            />
          ) : null}
        </div>
      </div>
      {endpoints.map((endpoint) => (
        <EndpointListing
          endpoint={endpoint}
          key={endpoint.id}
          parent={parent}
        />
      ))}
    </div>
  );
};

export function EndpointsView({
  endpoints,
  parent,
}: { endpoints: DeployEndpoint[]; parent: string }) {
  if (!endpoints.length) {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        // action={
        //   <ButtonIcon icon={<IconPlusCircle />} className="inline-flex">
        //     Add Endpoint
        //   </ButtonIcon>
        // }
        className="p-6 w-100"
      />
    );
  }

  return (
    <div className="mt-4">
      <EndpointsOverview endpoints={endpoints} parent={parent} />
    </div>
  );
}
