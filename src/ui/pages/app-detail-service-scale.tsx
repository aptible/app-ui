import { Box, BoxGroup, Button, FormGroup, Input, Label } from "../shared";
import {
  CONTAINER_PROFILES,
  CONTAINER_PROFILE_TYPES,
  ContainerProfileTypes,
  EXPONENTIAL_CONTAINER_SIZES_BY_PROFILE,
  computedCostsForContainer,
  fetchApp,
  fetchService,
  scaleService,
  selectAppById,
  selectServiceById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { appActivityUrl } from "@app/routes";
import { AppState } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

export const AppDetailServiceScalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "", serviceId = "" } = useParams();
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

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(
      scaleService({
        id: serviceId,
        containerCount,
        containerSize,
      }),
    );
    navigate(appActivityUrl(id));
  };

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
                      disabled={!!service}
                      value={containerProfileType}
                      className="mb-2 w-full appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                      placeholder="select"
                      onChange={(e) => {
                        e.preventDefault();
                        setContainerProfileType(
                          e.target.value as ContainerProfileTypes,
                        );
                      }}
                    >
                      {CONTAINER_PROFILE_TYPES.map((containerProfileType) => (
                        <option value={containerProfileType}>
                          {
                            CONTAINER_PROFILES[
                              containerProfileType as ContainerProfileTypes
                            ].name
                          }
                        </option>
                      ))}
                    </select>
                  </div>
                </FormGroup>
              </div>
              <div className="mb-4">
                <FormGroup
                  splitWidthInputs
                  description={`Horizontally scale this service by increasing the number of containers. A count of 2 or more will provide High Availability. 32 max count for ${CONTAINER_PROFILES[containerProfileType].name} profiles.`}
                  label="Number of Containers"
                  htmlFor="number-containers"
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
                      {EXPONENTIAL_CONTAINER_SIZES_BY_PROFILE(
                        containerProfileType,
                      )?.map((containerSizeOption) => (
                        <option value={containerSizeOption}>
                          {containerSizeOption / 1024} GB
                        </option>
                      )) || null}
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
                      value={
                        CONTAINER_PROFILES[containerProfileType].cpuShare *
                        containerSize
                      }
                      data-testid="number-containers"
                      id="number-containers"
                    />
                  </div>
                </FormGroup>
              </div>
            </div>
            {service ? (
              <div className="my-4 flex justify-between">
                <div>
                  <Label>Pricing</Label>
                  <p className="text-gray-500">
                    {service.containerCount} container
                    {service.containerCount > 1 ? "s" : ""} x{" "}
                    {service.containerMemoryLimitMb / 1024} GB x $
                    {(
                      CONTAINER_PROFILES[service.instanceClass]
                        .costPerContainerHourInCents / 100
                    ).toFixed(2)}{" "}
                    per GB/hour
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">
                    Current Estimated Monthly Cost
                  </p>
                  <p className="text-right text-lg text-green-400">
                    $
                    {(
                      computedCostsForContainer(
                        service.containerCount,
                        CONTAINER_PROFILES[service.instanceClass],
                        service.containerMemoryLimitMb,
                      ).estimatedCostInDollars / 1000
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : null}
            <hr />
            {changesExist ? (
              <p className="mt-4 font-normal text-gray-500">Pending Changes</p>
            ) : null}
            {containerProfileType !== service.instanceClass ? (
              <div className="my-4">
                <Label>Container Profile</Label>
                <p className="text-gray-500">
                  Changed from {CONTAINER_PROFILES[service.instanceClass].name}{" "}
                  to {CONTAINER_PROFILES[containerProfileType].name}
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
                    x $
                    {(
                      CONTAINER_PROFILES[containerProfileType]
                        .costPerContainerHourInCents / 100
                    ).toFixed(2)}{" "}
                    per GB/hour
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">New Estimated Monthly Cost</p>
                  <p className="text-right text-lg text-green-400">
                    $
                    {(
                      computedCostsForContainer(
                        containerCount || 1,
                        CONTAINER_PROFILES[containerProfileType],
                        containerSize,
                      ).estimatedCostInDollars / 1000
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="flex mt-4">
              <Button
                className="w-40 mb-4 flex font-semibold"
                type="submit"
                onClick={(e) => onSubmitForm(e)}
                disabled={!changesExist}
              >
                Save Changes
              </Button>
              {service && changesExist ? (
                <Button
                  className="w-40 ml-2 mb-4 flex font-semibold"
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
