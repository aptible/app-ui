import {
  containerSizesByProfile,
  getContainerProfileFromType,
  selectContainerProfilesForStack,
  selectEnvironmentById,
} from "@app/deploy";
import { useSelector } from "@app/react";
import type { DeployDisk, DeployService, InstanceClass } from "@app/types";
import type { DbScaleAction, DbScaleOptions, ValidResult } from "../../hooks";
import { FormGroup, Label } from "../form-group";
import { Input } from "../input";
import { Select, type SelectOption } from "../select";

export function PricingCalc({
  service,
  disk,
  pricePerHour,
  price,
}: {
  service: DeployService;
  disk: DeployDisk;
  pricePerHour: string;
  price: number;
}) {
  return (
    <div className="mt-2 mb-4 flex justify-between">
      <div>
        <Label>Pricing</Label>
        <p className="text-black-500">
          1 x {service.containerMemoryLimitMb / 1024} GB container x $
          {pricePerHour} per GB/hour
        </p>
        <p className="text-black-500">
          {disk.size} GB disk x $0.20 per GB/month
        </p>
      </div>

      <div>
        <p className="text-black-500">Estimated Monthly Cost</p>
        <p className="text-right text-lg text-green-400">${price.toFixed(2)}</p>
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
  // https://github.com/aptible/deploy-api/blob/f2e44361bb78b53256ba255876dea81f64f93a13/app/helpers/ebs_volume_helper.rb#L8-L14
  const desc =
    "Input/Output Operation Per Second.  The maximum ratio of provisioned IOPS to provisioned volume size is 500 IOPS per GiB. The overall maximum provisioned IOPS is 16,000.";
  return (
    <FormGroup splitWidthInputs description={desc} label="IOPS" htmlFor="iops">
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
