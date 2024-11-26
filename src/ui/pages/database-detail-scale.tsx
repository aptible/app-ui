import {
  fetchDatabase,
  fetchDiskById,
  fetchService,
  scaleDatabase,
  selectBackupsByDatabaseId,
  selectDatabaseById,
  selectDiskById,
  selectEndpointsByServiceId,
  selectManualScaleRecommendationByServiceId,
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
import { diskSizeValidator } from "@app/validator";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  defaultDatabaseScaler,
  useDatabaseScaler,
  useValidator,
} from "../hooks";
import {
  BannerMessages,
  Box,
  Button,
  ContainerProfileInput,
  ContainerSizeInput,
  CpuShareView,
  DiskSizeInput,
  Group,
  ManualScaleReason,
  ServicePricingCalc,
} from "../shared";

interface DatabaseScaleProps {
  diskSize: number;
}

const validators = {
  diskSize: (data: DatabaseScaleProps) => diskSizeValidator(data.diskSize),
};

export const DatabaseScalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [errors, validate] = useValidator<
    DatabaseScaleProps,
    typeof validators
  >(validators);

  useQuery(fetchDatabase({ id }));
  const database = useSelector((s) => selectDatabaseById(s, { id }));
  const serviceLoader = useQuery(fetchService({ id: database.serviceId }));
  useQuery(fetchDiskById({ id: database.diskId }));
  const disk = useSelector((s) => selectDiskById(s, { id: database.diskId }));
  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const endpoints = useSelector((s) =>
    selectEndpointsByServiceId(s, { serviceId: database.serviceId }),
  );
  const backups = useSelector((s) =>
    selectBackupsByDatabaseId(s, { dbId: id }),
  );
  const rec = useSelector((s) =>
    selectManualScaleRecommendationByServiceId(s, {
      serviceId: database.serviceId,
    }),
  );

  const [takingRec, setTakingRec] = useState(false);
  const {
    scaler,
    dispatchScaler,
    changesExist,
    requestedContainerProfile,
    currentContainerProfile,
  } = useDatabaseScaler({
    service,
    disk,
  });
  const hasChanges = changesExist && !serviceLoader.isInitialLoading;
  const action = scaleDatabase({
    id,
    recId: takingRec ? rec.id : "",
    ...scaler,
    originalValues: {
      diskSize: disk.size,
      containerSize: service.containerMemoryLimitMb,
      containerProfile: service.instanceClass,
    },
  });

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(scaler)) return;
    dispatch(action);
  };
  const loader = useLoader(scaleDatabase);

  useLoaderSuccess(loader, () => {
    navigate(databaseActivityUrl(database.id));
  });

  return (
    <Group>
      <Box>
        <form onSubmit={onSubmitForm}>
          <div className="flex flex-col gap-2">
            <h1 className="text-lg text-gray-500 mb-4">Manual Scale</h1>

            <ManualScaleReason serviceId={service.id}>
              <Button
                onClick={() => {
                  dispatchScaler({
                    type: "containerProfile",
                    payload:
                      `${rec.recommendedInstanceClass}5` as InstanceClass,
                  });
                  dispatchScaler({
                    type: "containerSize",
                    payload: rec.recommendedContainerMemoryLimitMb,
                  });
                  setTakingRec(true);
                }}
              >
                Autofill Changes
              </Button>
            </ManualScaleReason>

            <ContainerProfileInput
              scaler={scaler}
              dispatchScaler={dispatchScaler}
              envId={database.environmentId}
            />
            <DiskSizeInput
              scaler={scaler}
              dispatchScaler={dispatchScaler}
              error={errors.diskSize}
            />
            <ContainerSizeInput
              scaler={scaler}
              dispatchScaler={dispatchScaler}
            />
            <CpuShareView
              cpuShare={requestedContainerProfile.cpuShare}
              containerSize={scaler.containerSize}
            />
          </div>

          <ServicePricingCalc
            service={service}
            disk={disk}
            endpoints={endpoints}
            backups={backups}
          />

          <hr />

          {hasChanges ? (
            <div className="text-md font-semibold text-gray-900 mt-4">
              Pending Changes
            </div>
          ) : null}
          {scaler.containerProfile !== service.instanceClass ? (
            <div className="my-3">
              <div className="text-md text-gray-900">Container Profile</div>
              <p className="text-black-500">
                Changed from {currentContainerProfile.name} to{" "}
                {requestedContainerProfile.name}
              </p>
            </div>
          ) : null}
          {scaler.diskSize !== disk.size ? (
            <div className="my-3">
              <div className="text-md text-gray-900">Disk Size</div>
              <p className="text-black-500">
                Changed from {disk.size} GB to {scaler.diskSize} GB
              </p>
            </div>
          ) : null}
          {scaler.containerSize !== service.containerMemoryLimitMb ? (
            <div className="my-3">
              <div className="text-md text-gray-900">Container Size</div>
              <p className="text-black-500">
                Changed from {service.containerMemoryLimitMb / 1024} GB to{" "}
                {scaler.containerSize / 1024} GB
              </p>
            </div>
          ) : null}
          {hasChanges ? (
            <ServicePricingCalc
              service={{
                containerCount: service.containerCount,
                containerMemoryLimitMb: scaler.containerSize,
                instanceClass: scaler.containerProfile,
              }}
              disk={{ size: scaler.diskSize, provisionedIops: scaler.iops }}
              endpoints={endpoints}
              backups={backups}
            />
          ) : null}

          <BannerMessages {...loader} />

          <div className="flex mt-4">
            <Button
              className="w-40 flex font-semibold"
              disabled={!hasChanges}
              type="submit"
              isLoading={loader.isLoading}
            >
              Save Changes
            </Button>
            {hasChanges ? (
              <Button
                className="w-40 ml-2 flex font-semibold"
                onClick={() => {
                  dispatchScaler({
                    type: "set",
                    payload: defaultDatabaseScaler(service, disk),
                  });
                  setTakingRec(false);
                }}
                variant="white"
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Box>
    </Group>
  );
};
