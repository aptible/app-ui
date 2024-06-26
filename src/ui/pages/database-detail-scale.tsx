import {
  DEFAULT_INSTANCE_CLASS,
  containerSizesByProfile,
  fetchDatabase,
  fetchDiskById,
  fetchService,
  getContainerProfileFromType,
  hourlyAndMonthlyCostsForContainers,
  scaleDatabase,
  selectContainerProfilesForStack,
  selectDatabaseById,
  selectDiskById,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { databaseActivityUrl } from "@app/routes";
import type { InstanceClass } from "@app/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Input,
  Label,
  Select,
  type SelectOption,
} from "../shared";

const validators = {
  diskSize: (data: DatabaseScaleProps) => {
    if (data.diskSize < 10) {
      return "Disk size must be at least 10 GB";
    }
    if (data.diskSize > 16384) {
      return "Disk size cannot exceed 16384 GB";
    }
  },
};

type DatabaseScaleProps = {
  diskSize: number;
};

export const DatabaseScalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [errors, validate] = useValidator<
    DatabaseScaleProps,
    typeof validators
  >(validators);
  const [containerSize, setContainerSize] = useState(512);
  const [containerProfileType, setContainerProfileType] =
    useState<InstanceClass>(DEFAULT_INSTANCE_CLASS);
  const [diskValue, setDiskValue] = useState<number>(10);

  useQuery(fetchDatabase({ id }));
  const database = useSelector((s) => selectDatabaseById(s, { id }));
  const serviceLoader = useQuery(fetchService({ id: database.serviceId }));
  useQuery(fetchDiskById({ id: database.diskId }));
  const disk = useSelector((s) => selectDiskById(s, { id: database.diskId }));
  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const containerProfilesForStack = useSelector((s) =>
    selectContainerProfilesForStack(s, { id: environment.stackId }),
  );

  const action = scaleDatabase({
    id,
    diskSize: diskValue,
    containerSize: containerSize,
    containerProfile: containerProfileType,
  });

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate({ diskSize: diskValue })) return;
    dispatch(action);
  };
  const loader = useLoader(scaleDatabase);

  useEffect(() => {
    setContainerSize(service.containerMemoryLimitMb);
  }, [service.containerMemoryLimitMb]);

  useEffect(() => {
    setContainerProfileType(service.instanceClass);
  }, [service.instanceClass]);

  useEffect(() => {
    setDiskValue(disk.size);
  }, [disk.size]);

  useLoaderSuccess(loader, () => {
    navigate(databaseActivityUrl(database.id));
  });

  const changesExist =
    (service.containerMemoryLimitMb !== containerSize ||
      service.instanceClass !== containerProfileType ||
      disk.size !== diskValue) &&
    !serviceLoader.isInitialLoading;

  const currentContainerProfile = getContainerProfileFromType(
    service.instanceClass,
  );
  const requestedContainerProfile =
    getContainerProfileFromType(containerProfileType);
  const { pricePerHour: currentPricePerHour, pricePerMonth: currentPrice } =
    hourlyAndMonthlyCostsForContainers(
      service.containerCount,
      currentContainerProfile,
      service.containerMemoryLimitMb,
      disk.size,
    );
  const { pricePerHour: estimatedPricePerHour, pricePerMonth: estimatedPrice } =
    hourlyAndMonthlyCostsForContainers(
      1,
      requestedContainerProfile,
      containerSize,
      diskValue,
    );

  const handleContainerProfileSelection = (opt: SelectOption) => {
    const value = opt.value as InstanceClass;
    const profile = getContainerProfileFromType(value);
    if (!profile) {
      return;
    }

    setContainerProfileType(value);
    if (containerSize < profile.minimumContainerSize) {
      setContainerSize(profile.minimumContainerSize);
    }
  };

  const profileOptions = Object.keys(containerProfilesForStack).map(
    (containerProfileType) => {
      const profile = getContainerProfileFromType(
        containerProfileType as InstanceClass,
      );
      return { label: profile.name, value: containerProfileType };
    },
  );

  const containerSizeOptions = containerSizesByProfile(
    containerProfileType,
  ).map((containerSizeOption) => {
    return {
      label: `${containerSizeOption / 1024} GB`,
      value: `${containerSizeOption}`,
    };
  });

  return (
    <Box>
      <form onSubmit={onSubmitForm}>
        <div className="flex flex-col gap-2">
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
          <FormGroup
            splitWidthInputs
            description="Increase max disk space in GBs.  Space can only be increased once a day."
            label="Disk Size"
            htmlFor="disk-size"
            feedbackMessage={errors.diskSize}
            feedbackVariant={errors.diskSize ? "danger" : "info"}
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
              value={requestedContainerProfile.cpuShare * containerSize}
              data-testid="number-containers"
              id="number-containers"
            />
          </FormGroup>
        </div>

        <div className="mt-2 mb-4 flex justify-between">
          <div>
            <Label>Pricing</Label>
            <p className="text-black-500">
              1 x {service.containerMemoryLimitMb / 1024} GB container x $
              {currentPricePerHour} per GB/hour
            </p>
            <p className="text-black-500">
              {disk.size} GB disk x $0.20 per GB/month
            </p>
          </div>

          <div>
            <p className="text-black-500">Estimated Monthly Cost</p>
            <p className="text-right text-lg text-green-400">${currentPrice}</p>
          </div>
        </div>

        <hr />

        {changesExist ? (
          <div className="text-md font-semibold text-gray-900 mt-4">
            Pending Changes
          </div>
        ) : null}
        {containerProfileType !== service.instanceClass ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Container Profile</div>
            <p className="text-black-500">
              Changed from {currentContainerProfile.name} to{" "}
              {requestedContainerProfile.name}
            </p>
          </div>
        ) : null}
        {diskValue !== disk.size ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Disk Size</div>
            <p className="text-black-500">
              Changed from {disk.size} GB to {diskValue} GB
            </p>
          </div>
        ) : null}
        {containerSize !== service.containerMemoryLimitMb ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Container Size</div>
            <p className="text-black-500">
              Changed from {service.containerMemoryLimitMb / 1024} GB to{" "}
              {containerSize / 1024} GB
            </p>
          </div>
        ) : null}
        {changesExist ? (
          <div className="my-3 flex justify-between">
            <div>
              <div className="text-md text-gray-900">Pricing</div>
              <p className="text-black-500">
                1 x {containerSize / 1024} GB container x $
                {estimatedPricePerHour} per GB/hour
              </p>
            </div>
            <div>
              <p className="text-black-500">New Estimated Monthly Cost</p>
              <p className="text-right text-lg text-green-400">
                ${estimatedPrice}
              </p>
            </div>
          </div>
        ) : null}

        <BannerMessages {...loader} />

        <div className="flex mt-4">
          <Button
            className="w-40 flex font-semibold"
            disabled={!changesExist}
            type="submit"
          >
            Save Changes
          </Button>
          {changesExist ? (
            <Button
              className="w-40 ml-2 flex font-semibold"
              onClick={() => {
                setContainerProfileType(service.instanceClass);
                setContainerSize(service.containerMemoryLimitMb);
                if (disk.size > 0) {
                  setDiskValue(disk.size);
                }
              }}
              variant="white"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Box>
  );
};
