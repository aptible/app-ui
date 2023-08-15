import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  BoxGroup,
  Button,
  FormGroup,
  Input,
  Label,
} from "../shared";
import {
  ContainerProfileTypes,
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
import { operationDetailUrl } from "@app/routes";
import { AppState } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

const validators = {
  containerCount: (data: AppScaleProps) => {
    if (data.containerCount < 1) {
      return "Container count must be at least 1";
    }
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
    useState<ContainerProfileTypes>("m5");
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
  });
  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!validate({ containerCount })) return;
    dispatch(action);
  };
  const loader = useLoader(action);

  useEffect(() => {
    if (service.containerCount) {
      setContainerCount(service.containerCount);
    }
    if (service.instanceClass) {
      setContainerProfileType(service.instanceClass);
    }
    if (service.containerMemoryLimitMb) {
      setContainerSize(service.containerMemoryLimitMb);
    }
  }, [app, service]);

  const changesExist =
    service.containerCount !== containerCount ||
    service.instanceClass !== containerProfileType ||
    service.containerMemoryLimitMb !== containerSize;

  useLoaderSuccess(loader, () => {
    navigate(operationDetailUrl(loader.meta.opId));
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

  const handleContainerProfileSelection = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const value = e.currentTarget.value as ContainerProfileTypes;
    if (!Object.keys(containerProfilesForStack).includes(value)) {
      return;
    }
    setContainerProfileType(value);
  };

  return (
    <div>
      <BoxGroup>
        <Box>
          <form onSubmit={onSubmitForm}>
            <div className="mb-4">
              <div className="mb-4">
                <FormGroup
                  splitWidthInputs
                  description="Optimize container performance with a custom profile."
                  label="Container Profile"
                  htmlFor="container-profile"
                >
                  <div className="flex justify-between items-center mb-4 w-full">
                    <select
                      disabled={
                        Object.keys(containerProfilesForStack).length <= 1
                      }
                      value={containerProfileType}
                      className="mb-2 w-full appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                      placeholder="select"
                      onChange={handleContainerProfileSelection}
                    >
                      {Object.keys(containerProfilesForStack).map(
                        (containerProfileType) => (
                          <option
                            key={containerProfileType}
                            value={containerProfileType}
                          >
                            {
                              getContainerProfileFromType(
                                containerProfileType as ContainerProfileTypes,
                              ).name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </FormGroup>
              </div>
              <div className="mb-4">
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
                  <div className="flex justify-between items-center mb-4 w-full">
                    <Input
                      className="flex w-full"
                      name="number-containers"
                      type="number"
                      value={containerCount}
                      min="1"
                      max="32"
                      onChange={(e) =>
                        setContainerCount(parseInt(e.currentTarget.value, 10))
                      }
                      data-testid="number-containers"
                      id="number-containers"
                    />
                  </div>
                </FormGroup>
              </div>
              <div className="mb-4">
                <FormGroup
                  splitWidthInputs
                  description="Specify the memory you wish to allow per container."
                  label="Memory per Container"
                  htmlFor="memory-container"
                >
                  <div className="flex justify-between items-center mb-4 w-full">
                    <select
                      value={containerSize}
                      className="mb-2 w-full appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                      placeholder="select"
                      onChange={(e) => {
                        e.preventDefault();
                        setContainerSize(parseInt(e.target.value));
                      }}
                    >
                      {exponentialContainerSizesByProfile(
                        containerProfileType,
                      ).map((containerSizeOption) => (
                        <option
                          key={containerSizeOption}
                          value={containerSizeOption}
                        >
                          {containerSizeOption / 1024} GB
                        </option>
                      ))}
                    </select>
                  </div>
                </FormGroup>
              </div>
              <div className="mb-4">
                <FormGroup
                  splitWidthInputs
                  description="CPU Share is determined by the selected Memory Limit and Container Profile."
                  label="CPU Share per Container"
                  htmlFor="cpu-share"
                >
                  <div className="flex justify-between items-center mb-4 w-full">
                    <Input
                      className="flex disabled w-full"
                      name="number-containers"
                      type="text"
                      disabled
                      value={currentContainerProfile.cpuShare * containerSize}
                      data-testid="number-containers"
                      id="number-containers"
                    />
                  </div>
                </FormGroup>
              </div>
            </div>
            <div className="my-4 flex justify-between">
              <div>
                <Label>Pricing</Label>
                <p className="text-gray-500">
                  {service.containerCount} container
                  {service.containerCount > 1 ? "s" : ""} x{" "}
                  {service.containerMemoryLimitMb / 1024} GB x $
                  {currentPricePerHour} per GB/hour
                </p>
              </div>
              <div>
                <p className="text-gray-500">Current Estimated Monthly Cost</p>
                <p className="text-right text-lg text-green-400">
                  ${currentPrice}
                </p>
              </div>
            </div>
            <hr />
            {changesExist ? (
              <p className="mt-4 font-normal text-gray-500">Pending Changes</p>
            ) : null}
            {containerProfileType !== service.instanceClass ? (
              <div className="my-4">
                <Label>Container Profile</Label>
                <p className="text-gray-500">
                  Changed from {currentContainerProfile.name} to{" "}
                  {requestedContainerProfile.name}
                </p>
              </div>
            ) : null}
            {containerCount !== service.containerCount ? (
              <div className="my-4">
                <Label>Container Count</Label>
                <p className="text-gray-500">
                  Changed from {service.containerCount} to {containerCount}
                </p>
              </div>
            ) : null}
            {containerSize !== service.containerMemoryLimitMb ? (
              <div className="my-4">
                <Label>Container Size</Label>
                <p className="text-gray-500">
                  Changed from {service.containerMemoryLimitMb / 1024} GB to{" "}
                  {containerSize / 1024} GB
                </p>
              </div>
            ) : null}
            {changesExist ? (
              <div className="my-4 flex justify-between">
                <div>
                  <Label>Pricing</Label>
                  <p className="text-gray-500">
                    {containerCount || 1} container
                    {containerCount > 1 ? "s" : ""} x {containerSize / 1024} GB
                    x ${estimatedPricePerHour} per GB/hour
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">New Estimated Monthly Cost</p>
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
      </BoxGroup>
    </div>
  );
};
