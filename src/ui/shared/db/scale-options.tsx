import {
  containerSizesByProfile,
  getContainerProfileFromType,
  selectContainerProfilesForStack,
  selectEnvironmentById,
} from "@app/deploy";
import { useSelector } from "@app/react";
import type { DeployDisk, DeployService, InstanceClass } from "@app/types";
import type { ValidResult } from "../../hooks";
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
        <p className="text-right text-lg text-green-400">${price}</p>
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
  containerSize,
  setContainerSize,
  containerProfileType,
}: {
  containerSize: number;
  setContainerSize: (c: number) => void;
  containerProfileType: InstanceClass;
}) {
  const containerSizeOptions = containerSizesByProfile(
    containerProfileType,
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
        value={`${containerSize}`}
        onSelect={(opt) => setContainerSize(Number.parseInt(opt.value))}
        options={containerSizeOptions}
      />
    </FormGroup>
  );
}

export function DiskSizeInput({
  diskValue,
  setDiskValue,
  error,
}: {
  diskValue: number;
  setDiskValue: (dsk: number) => void;
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
        value={diskValue}
        min="10"
        onChange={(e) =>
          setDiskValue(
            Math.min(16384, Number.parseInt(e.currentTarget.value, 10)),
          )
        }
        data-testid="disk-size"
        id="disk-size"
      />
    </FormGroup>
  );
}

export function ContainerProfileInput({
  envId,
  containerProfileType,
  setContainerProfileType,
}: {
  envId: string;
  containerProfileType: InstanceClass;
  setContainerProfileType: (pt: InstanceClass) => void;
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
  const handleContainerProfileSelection = (opt: SelectOption) => {
    const value = opt.value as InstanceClass;
    const profile = getContainerProfileFromType(value);
    if (!profile) {
      return;
    }

    setContainerProfileType(value);
    /* if (containerSize < profile.minimumContainerSize) {
      setContainerSize(profile.minimumContainerSize);
    } */
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
        value={containerProfileType}
        onSelect={handleContainerProfileSelection}
        options={profileOptions}
      />
    </FormGroup>
  );
}