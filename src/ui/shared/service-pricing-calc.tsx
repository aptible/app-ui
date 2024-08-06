import {
  type BackupCostProps,
  type DiskCostProps,
  type EndpointCostProps,
  type ServiceCostProps,
  backupCostPerGBMonth,
  containerProfileCostPerGBHour,
  containerSizesByProfile,
  diskCostPerGBMonth,
  diskIopsCostPerMonth,
  endpointCostPerHour,
  estimateMonthlyCost,
  formatCurrency,
  getContainerProfileFromType,
  selectContainerProfilesForStack,
  selectEnvironmentById,
} from "@app/deploy";
import { useSelector } from "@app/react";
import type { InstanceClass } from "@app/types";
import type { DbScaleAction, DbScaleOptions, ValidResult } from "../hooks";
import { FormGroup, Label } from "./form-group";
import { Input } from "./input";
import { Select, type SelectOption } from "./select";

export type ServicePricingCalcProps = {
  service: ServiceCostProps;
  disk?: DiskCostProps;
  endpoints?: EndpointCostProps[];
  backups?: BackupCostProps[];
};

export function ServicePricingCalc({
  service,
  disk,
  endpoints = [],
  backups = [],
}: ServicePricingCalcProps) {
  const cost = estimateMonthlyCost({
    services: [service],
    disks: disk == null ? [] : [disk],
    endpoints,
    backups,
  });

  const costPerGBHour = containerProfileCostPerGBHour(service.instanceClass);
  const containerCost = estimateMonthlyCost({ services: [service] });
  const endpointCost = estimateMonthlyCost({ endpoints });
  const backupCost = estimateMonthlyCost({ backups });

  const backupSize = backups.reduce((acc, backup) => acc + backup.size, 0);

  return (
    <div className="mt-2 mb-4 flex">
      <div className="grow basis-1">
        <Label>Estimated Cost Breakdown</Label>
        <div className="grid grid-cols-[auto,1fr] gap-x-3 text-black-500">
          <div>
            1 x {service.containerMemoryLimitMb / 1024} GB container x{" "}
            {formatCurrency(costPerGBHour)} per GB/hour
          </div>
          <div>= {formatCurrency(containerCost)}/month</div>
          {disk == null ? null : (
            <>
              <div>
                {disk.size} GB disk x {formatCurrency(diskCostPerGBMonth)} per
                GB/month
                {disk.provisionedIops > 3000
                  ? ` + ${disk.provisionedIops - 3000} IOPS x ${formatCurrency(diskIopsCostPerMonth)} per month`
                  : ""}
              </div>
              <div>
                = {formatCurrency(estimateMonthlyCost({ disks: [disk] }))}
                /month
              </div>
            </>
          )}
          {endpoints.length > 0 ? (
            <>
              <div>
                {endpoints.length} endpoint{endpoints.length > 1 ? "s" : ""} x{" "}
                {formatCurrency(endpointCostPerHour)} per hour
              </div>
              <div>= {formatCurrency(endpointCost)}/month</div>
            </>
          ) : null}
          {backups.length > 0 ? (
            <>
              <div>
                {backupSize} GB backups x {formatCurrency(backupCostPerGBMonth)}{" "}
                per GB/month
              </div>
              <div>= {formatCurrency(backupCost)}/month</div>
            </>
          ) : null}
        </div>
      </div>

      <div className="grow basis-1">
        <Label>Estimated Monthly Cost</Label>
        <p className="text-lg text-green-400">{formatCurrency(cost)}</p>
        <p className="text-black-500">
          This is an estimate of the cost of running the current resources for
          one month. It is updated automatically as resources are added or
          scaled to reflect the new estimated monthly cost. Please note: it does
          not represent your actual usage for the month (ongoing scaling
          operations or deprovisioned resources are not reflected).
        </p>
      </div>
    </div>
  );
}

export function CpuShareView({
  cpuShare,
  containerSize,
}: { cpuShare: number; containerSize: number }) {
  return (
    <FormGroup
      splitWidthInputs
      description="CPU Share is determined by the selected Memory Limit and Container Profile."
      label="CPU Share per Container"
      htmlFor="cpu-share"
    >
      <Input
        className="flex disabled w-full"
        name="number-containers"
        type="text"
        disabled
        value={cpuShare * containerSize}
        data-testid="number-containers"
        id="number-containers"
      />
    </FormGroup>
  );
}

export function ContainerSizeInput({
  scaler,
  dispatchScaler,
}: {
  scaler: DbScaleOptions;
  dispatchScaler: (a: DbScaleAction) => void;
}) {
  const containerSizeOptions = containerSizesByProfile(
    scaler.containerProfile,
  ).map((containerSizeOption) => {
    return {
      label: `${containerSizeOption / 1024} GB`,
      value: `${containerSizeOption}`,
    };
  });
  return (
    <FormGroup
      splitWidthInputs
      description="Specify the memory you wish to allow per container."
      label="Memory per Container"
      htmlFor="memory-container"
    >
      <Select
        id="memory-container"
        value={`${scaler.containerSize}`}
        onSelect={(opt) =>
          dispatchScaler({
            type: "containerSize",
            payload: Number.parseInt(opt.value),
          })
        }
        options={containerSizeOptions}
      />
    </FormGroup>
  );
}

export function DiskSizeInput({
  scaler,
  dispatchScaler,
  error,
}: {
  scaler: Pick<DbScaleOptions, "diskSize">;
  dispatchScaler: (a: DbScaleAction) => void;
  error: ValidResult;
}) {
  return (
    <FormGroup
      splitWidthInputs
      description="Increase max disk space in GBs.  Space can only be increased once a day."
      label="Disk Size"
      htmlFor="disk-size"
      feedbackMessage={error}
      feedbackVariant={error ? "danger" : "info"}
    >
      <Input
        className="flex w-full"
        name="disk-size"
        type="number"
        value={scaler.diskSize}
        min="10"
        onChange={(e) => {
          const payload = Math.min(
            16384,
            Number.parseInt(e.currentTarget.value, 10),
          );
          dispatchScaler({ type: "diskSize", payload });
        }}
        data-testid="disk-size"
        id="disk-size"
      />
    </FormGroup>
  );
}

export function IopsInput({
  scaler,
  dispatchScaler,
}: {
  scaler: Pick<DbScaleOptions, "iops">;
  dispatchScaler: (a: DbScaleAction) => void;
}) {
  return (
    <FormGroup
      splitWidthInputs
      description="Input/Output Operation Per Second. Maximum ratio is 50:1 between IOPS and Disk Size."
      label="IOPS"
      htmlFor="iops"
    >
      <Input
        className="flex w-full"
        name="iops"
        type="number"
        value={scaler.iops}
        min="0"
        onChange={(e) => {
          const payload = Number.parseInt(e.currentTarget.value, 10);
          dispatchScaler({ type: "iops", payload });
        }}
        data-testid="iops"
        id="iops"
      />
    </FormGroup>
  );
}

export function ContainerProfileInput({
  envId,
  scaler,
  dispatchScaler,
}: {
  envId: string;
  scaler: Pick<DbScaleOptions, "containerProfile">;
  dispatchScaler: (a: DbScaleAction) => void;
}) {
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: envId }),
  );
  const containerProfilesForStack = useSelector((s) =>
    selectContainerProfilesForStack(s, { id: environment.stackId }),
  );
  const profileOptions = Object.keys(containerProfilesForStack).map(
    (containerProfileType) => {
      const profile = getContainerProfileFromType(
        containerProfileType as InstanceClass,
      );
      return { label: profile.name, value: containerProfileType };
    },
  );
  const onSelect = (opt: SelectOption) => {
    dispatchScaler({
      type: "containerProfile",
      payload: opt.value as InstanceClass,
    });
  };

  return (
    <FormGroup
      splitWidthInputs
      description="Optimize container performance with a custom profile."
      label="Container Profile"
      htmlFor="container-profile"
    >
      <Select
        id="container-profile"
        ariaLabel="container-profile"
        disabled={Object.keys(containerProfilesForStack).length <= 1}
        value={scaler.containerProfile}
        onSelect={onSelect}
        options={profileOptions}
      />
    </FormGroup>
  );
}
