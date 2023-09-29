import {
  DEFAULT_INSTANCE_CLASS,
  exponentialContainerSizesByProfile,
  fetchApp,
  fetchService,
  getContainerProfileFromType,
  hourlyAndMonthlyCostsForContainers,
  scaleService,
  selectAppById,
  selectContainerProfilesForStack,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { appActivityUrl } from "@app/routes";
import { AppState, InstanceClass } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  SelectOption,
} from "../shared";

const validators = {
  containerCount: (data: AppScaleProps) => {
    if (data.containerCount > 32) {
      return "Container count cannot exceed 32";
    }
  },
};

type AppScaleProps = {
  containerCount: number;
};

export const AppDetailServiceScalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "", serviceId = "" } = useParams();
  const [errors, validate] = useValidator<AppScaleProps, typeof validators>(
    validators,
  );
  useQuery(fetchApp({ id }));
  const [containerCount, setContainerCount] = useState(1);
  const [containerProfileType, setContainerProfileType] =
    useState<InstanceClass>(DEFAULT_INSTANCE_CLASS);
  const [containerSize, setContainerSize] = useState<number>(512);
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  useQuery(fetchService({ id: serviceId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const containerProfilesForStack = useSelector((s: AppState) =>
    selectContainerProfilesForStack(s, { id: environment.stackId }),
  );

  const action = scaleService({
    id: serviceId,
    containerCount,
    containerSize,
    containerProfile: containerProfileType,
  });
  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!validate({ containerCount })) return;
    dispatch(action);
  };
  const loader = useLoader(action);

  useEffect(() => {
    setContainerCount(service.containerCount);
  }, [service.containerCount]);

  useEffect(() => {
    setContainerProfileType(service.instanceClass);
  }, [service.instanceClass]);

  useEffect(() => {
    if (service.containerMemoryLimitMb) {
      setContainerSize(service.containerMemoryLimitMb);
    }
  }, [service.containerMemoryLimitMb]);

  const changesExist =
    service.containerCount !== containerCount ||
    service.instanceClass !== containerProfileType ||
    service.containerMemoryLimitMb !== containerSize;

  useLoaderSuccess(loader, () => {
    navigate(appActivityUrl(app.id));
  });

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
    );
  const { pricePerHour: estimatedPricePerHour, pricePerMonth: estimatedPrice } =
    hourlyAndMonthlyCostsForContainers(
      containerCount,
      requestedContainerProfile,
      containerSize,
    );

  const profileOptions = Object.keys(containerProfilesForStack).map(
    (profileType) => {
      const profile = getContainerProfileFromType(profileType as InstanceClass);
      return {
        label: profile.name,
        value: profileType,
      };
    },
  );

  const memoryContainerOptions = exponentialContainerSizesByProfile(
    containerProfileType,
  ).map((containerSizeOption) => {
    return {
      label: `${containerSizeOption / 1024} GB`,
      value: `${containerSizeOption}`,
    };
  });

  const changeContainerProfile = (opt: SelectOption) => {
    const instClass = opt.value as InstanceClass;
    const profile = containerProfilesForStack[instClass];
    if (!profile) {
      return;
    }

    if (containerSize < profile.minimumContainerSize) {
      setContainerSize(profile.minimumContainerSize);
    }
    setContainerProfileType(instClass);
  };

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
              onSelect={changeContainerProfile}
              options={profileOptions}
            />
          </FormGroup>
          <FormGroup
            splitWidthInputs
            description={`Horizontally scale this service by increasing the number of containers. A count of 2 or more will provide High Availability. 32 max count for ${
              getContainerProfileFromType(containerProfileType).name
            } profiles.`}
            label="Number of Containers"
            htmlFor="number-containers"
            feedbackMessage={errors.containerCount}
            feedbackVariant={errors.containerCount ? "danger" : "info"}
          >
            <Input
              id="number-containers"
              name="number-containers"
              type="number"
              value={containerCount}
              min="0"
              max="32"
              onChange={(e) =>
                setContainerCount(parseInt(e.currentTarget.value || "0", 10))
              }
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
              value={containerSize.toString()}
              onSelect={(opt) => setContainerSize(parseInt(opt.value))}
              options={memoryContainerOptions}
            />
          </FormGroup>
          <FormGroup
            splitWidthInputs
            description="CPU Share is determined by the selected Memory Limit and Container Profile."
            label="CPU Share per Container"
            htmlFor="cpu-share"
          >
            <Input
              id="number-containers"
              name="number-containers"
              className="disabled"
              type="text"
              disabled
              value={requestedContainerProfile.cpuShare * containerSize}
            />
          </FormGroup>
        </div>

        <div className="mt-2 mb-4 flex justify-between">
          <div>
            <Label>Pricing</Label>
            <p className="text-black-500">
              {service.containerCount} container
              {service.containerCount > 1 ? "s" : ""} x{" "}
              {service.containerMemoryLimitMb / 1024} GB x $
              {currentPricePerHour} per GB/hour
            </p>
          </div>
          <div>
            <p className="text-black-500">Current Estimated Monthly Cost</p>
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
        {containerCount !== service.containerCount ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Container Count</div>
            <p className="text-black-500">
              Changed from {service.containerCount} to {containerCount}
            </p>
          </div>
        ) : null}
        {containerSize !== service.containerMemoryLimitMb ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Container Size</div>
            <p className="text-black-500" id="container-size-txt">
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
                {containerCount} container
                {containerCount > 1 || containerCount === 0 ? "s" : ""} x{" "}
                {containerSize / 1024} GB x ${estimatedPricePerHour} per GB/hour
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
            type="submit"
            disabled={!changesExist}
          >
            Save Changes
          </Button>

          {changesExist ? (
            <Button
              className="w-40 ml-2 flex font-semibold"
              onClick={() => {
                setContainerProfileType(service.instanceClass);
                setContainerSize(service.containerMemoryLimitMb);
                setContainerCount(service.containerCount);
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
