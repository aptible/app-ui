import {
  DEFAULT_INSTANCE_CLASS,
  fetchDatabase,
  fetchDiskById,
  fetchService,
  getContainerProfileFromType,
  hourlyAndMonthlyCostsForContainers,
  scaleDatabase,
  selectDatabaseById,
  selectDiskById,
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
  ContainerProfileInput,
  ContainerSizeInput,
  CpuShareView,
  DiskSizeInput,
  PricingCalc,
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

  return (
    <Box>
      <form onSubmit={onSubmitForm}>
        <div className="flex flex-col gap-2">
          <ContainerProfileInput
            envId={database.environmentId}
            containerProfileType={containerProfileType}
            setContainerProfileType={setContainerProfileType}
            containerSize={containerSize}
            setContainerSize={setContainerSize}
          />
          <DiskSizeInput
            diskValue={diskValue}
            setDiskValue={setDiskValue}
            error={errors.diskSize}
          />
          <ContainerSizeInput
            containerSize={containerSize}
            setContainerSize={setContainerSize}
            containerProfileType={containerProfileType}
          />
          <CpuShareView
            cpuShare={requestedContainerProfile.cpuShare}
            containerSize={containerSize}
          />
        </div>

        <PricingCalc
          service={service}
          disk={disk}
          pricePerHour={currentPricePerHour}
          price={currentPrice}
        />

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
