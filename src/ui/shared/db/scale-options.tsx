import {
  containerSizesByProfile,
  getContainerProfileFromType,
  selectContainerProfilesForStack,
  selectEnvironmentById,
} from "@app/deploy";
import { useSelector } from "@app/react";
import type { InstanceClass } from "@app/types";
import type { DbScaleAction, DbScaleOptions, ValidResult } from "../../hooks";
import { FormGroup } from "../form-group";
import { Input } from "../input";
import { Select, type SelectOption } from "../select";

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
  minSize = 0,
}: {
  scaler: DbScaleOptions;
  dispatchScaler: (a: DbScaleAction) => void;
  minSize?: number;
}) {
  const containerSizeOptions = containerSizesByProfile(scaler.containerProfile)
    .filter((containerSizeOption) => containerSizeOption >= minSize)
    .map((containerSizeOption) => {
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
  const desc =
    "The maximum IOPS is 16,000, but you must meet a minimum ratio of 1 GB disk size per 500 IOPS. For example, to reach 16,000 IOPS, you must have at least a 32 GB or larger disk.";
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
