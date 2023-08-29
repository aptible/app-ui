import {
  exponentialContainerSizesByProfile,
  fetchDatabase,
  fetchService,
  getContainerProfileFromType,
  hourlyAndMonthlyCostsForContainers,
  scaleDatabase,
  selectContainerProfilesForStack,
  selectDatabaseById,
  selectEnvironmentById,
  selectServiceById,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { operationDetailUrl } from "@app/routes";
import { AppState, InstanceClass } from "@app/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
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
    useState<InstanceClass>("m4");
  const [diskValue, setDiskValue] = useState<number>(10);

  useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  useQuery(fetchService({ id: database.serviceId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const containerProfilesForStack = useSelector((s: AppState) =>
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
  const loader = useLoader(action);

  useEffect(() => {
    if (service.containerMemoryLimitMb) {
      setContainerSize(service.containerMemoryLimitMb);
    }
    if (service.instanceClass) {
      setContainerProfileType(service.instanceClass);
    }
    if (service.containerMemoryLimitMb && database.disk?.size) {
      setDiskValue(database.disk.size);
    }
  }, [database]);

  useLoaderSuccess(loader, () => {
    navigate(operationDetailUrl(loader.meta.opId));
  });

  const changesExist =
    service.containerMemoryLimitMb !== containerSize ||
    service.instanceClass !== containerProfileType ||
    database.disk?.size !== diskValue;

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
      database.disk?.size || 0,
    );
  const { pricePerHour: estimatedPricePerHour, pricePerMonth: estimatedPrice } =
    hourlyAndMonthlyCostsForContainers(
      1,
      requestedContainerProfile,
      containerSize,
      diskValue,
    );

  const handleContainerProfileSelection = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const value = e.currentTarget.value as InstanceClass;
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
                                containerProfileType as InstanceClass,
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
                  description="Increase the maximum available disk space in GBs. Disk Size can be resized at most once a day, and can only be resized up (i.e. you cannot shrink your Database Disk)."
                  label="Disk Size"
                  htmlFor="disk-size"
                  feedbackMessage={errors.diskSize}
                  feedbackVariant={errors.diskSize ? "danger" : "info"}
                >
                  <div className="flex justify-between items-center mb-4 w-full">
                    <Input
                      className="flex w-full"
                      name="disk-size"
                      type="number"
                      value={diskValue}
                      min="10"
                      onChange={(e) =>
                        setDiskValue(
                          Math.min(16384, parseInt(e.currentTarget.value, 10)),
                        )
                      }
                      data-testid="disk-size"
                      id="disk-size"
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
                      name="memory-container"
                      id="memory-container"
                      data-testid="memory-container"
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
                      value={requestedContainerProfile.cpuShare * containerSize}
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
                  1 x {service.containerMemoryLimitMb / 1024} GB container x $
                  {currentPricePerHour} per GB/hour
                </p>
                {database.disk?.size ? (
                  <p className="text-gray-500">
                    {database.disk.size} GB disk x $0.20 per GB/month
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-gray-500">Estimated Monthly Cost</p>
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
            {containerSize !== service.containerMemoryLimitMb ? (
              <div className="my-4">
                <Label>Container Size</Label>
                <p className="text-gray-500">
                  Changed from {service.containerMemoryLimitMb / 1024} GB to{" "}
                  {containerSize / 1024} GB
                </p>
              </div>
            ) : null}
            {diskValue !== database.disk?.size ? (
              <div className="my-4">
                <Label>Disk Size</Label>
                <p className="text-gray-500">
                  Changed from {database.disk?.size || 0} GB to {diskValue} GB
                </p>
              </div>
            ) : null}
            {changesExist ? (
              <div className="my-4 flex justify-between">
                <div>
                  <Label>Pricing</Label>
                  <p className="text-gray-500">
                    1 x {containerSize / 1024} GB container x $
                    {estimatedPricePerHour} per GB/hour
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
                disabled={!changesExist}
                type="submit"
              >
                Save Changes
              </Button>
              {changesExist ? (
                <Button
                  className="w-40 ml-2 flex font-semibold"
                  onClick={() => {
                    setContainerSize(service.containerMemoryLimitMb);
                    if (database.disk?.size) setDiskValue(database.disk.size);
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
