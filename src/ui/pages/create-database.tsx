import {
  type CreateDatabaseProps,
  fetchDatabaseImages,
  provisionDatabase,
  selectDatabaseImagesVisible,
  selectEnvironmentById,
} from "@app/deploy";
import { generateHash } from "@app/id";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { environmentActivityUrl, environmentDatabasesUrl } from "@app/routes";
import { defaultDeployDisk, defaultDeployService } from "@app/schema";
import {
  diskSizeValidator,
  existValidtor,
  handleValidator,
} from "@app/validator";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDatabaseScaler, useValidator } from "../hooks";
import { EnvironmentDetailLayout } from "../layouts";
import {
  BannerMessages,
  Box,
  Button,
  ButtonCreate,
  ContainerProfileInput,
  ContainerSizeInput,
  CpuShareView,
  DatabaseNameInput,
  DiskSizeInput,
  FormGroup,
  IopsInput,
  PricingCalc,
  Select,
  type SelectOption,
} from "../shared";
import { EnvSelectorPage } from "./create-env-app";

const validators = {
  handle: (props: CreateDatabaseProps) => handleValidator(props.handle),
  diskSize: (props: CreateDatabaseProps) => diskSizeValidator(props.diskSize),
  databaseImageId: (props: CreateDatabaseProps) =>
    existValidtor(props.databaseImageId, "must pick database"),
};

export const CreateDatabasePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const envId = params.get("environment_id") || "";
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const [errors, validate] = useValidator<
    CreateDatabaseProps,
    typeof validators
  >(validators);

  const imgLoader = useQuery(fetchDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesVisible);
  const imgOptions = [
    { value: "", label: "Choose a Database" },
    ...dbImages.map((img) => ({
      label: img.description,
      value: img.id,
    })),
  ];
  const [imageId, setImageId] = useState("");
  const [dbName, setDbName] = useState("");
  const imgSelected = dbImages.find((i) => i.id === imageId);
  const selectChange = (option: SelectOption) => {
    const imgId = option.value;
    const img = dbImages.find((i) => i.id === imgId);
    const namePrefix = `${env.handle}-${generateHash(5)}`;
    const name = `${namePrefix}-${img?.type || ""}`;
    setImageId(imgId);
    setDbName(name);
  };

  const service = defaultDeployService();
  const disk = defaultDeployDisk();
  const {
    scaler,
    dispatchScaler,
    requestedPricePerGBHour,
    estimatedPrice,
    requestedContainerProfile,
  } = useDatabaseScaler({
    service,
    disk,
  });

  const createProps: CreateDatabaseProps = {
    envId,
    type: imgSelected?.type || "",
    handle: dbName,
    databaseImageId: imageId,
    enableBackups: true,
    ...scaler,
  };
  const action = provisionDatabase(createProps);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(createProps)) return;
    dispatch(action);
  };
  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
    navigate(environmentActivityUrl(envId));
  });

  if (!envId) {
    return (
      <EnvSelectorPage
        onSuccess={(p) => {
          setParams(
            { stack_id: p.stackId, environment_id: p.envId },
            { replace: true },
          );
        }}
      />
    );
  }

  return (
    <EnvironmentDetailLayout>
      <Box>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <FormGroup htmlFor="new-db" label="Database Type">
              <Select
                id="new-db"
                ariaLabel="new-db"
                onSelect={selectChange}
                value={imageId}
                options={imgOptions}
                className="flex-1 mr-2"
                disabled={imgLoader.isLoading}
              />
            </FormGroup>
            <DatabaseNameInput
              value={createProps.handle}
              onChange={(value) => setDbName(value)}
              feedbackMessage={errors.handle}
              feedbackVariant={errors.handle ? "danger" : "default"}
            />
            <ContainerProfileInput
              scaler={scaler}
              dispatchScaler={dispatchScaler}
              envId={envId}
            />
            <DiskSizeInput
              scaler={scaler}
              dispatchScaler={dispatchScaler}
              error={errors.diskSize}
            />
            <IopsInput scaler={scaler} dispatchScaler={dispatchScaler} />
            <ContainerSizeInput
              scaler={scaler}
              dispatchScaler={dispatchScaler}
            />
            <CpuShareView
              cpuShare={requestedContainerProfile.cpuShare}
              containerSize={scaler.containerSize}
            />
            <PricingCalc
              service={service}
              disk={disk}
              pricePerGBHour={requestedPricePerGBHour}
              price={estimatedPrice}
            />
          </div>

          <hr className="my-4" />

          <BannerMessages className="mb-4" {...loader} />

          <div className="flex gap-2">
            <ButtonCreate
              envId={envId}
              type="submit"
              isLoading={loader.isLoading}
              disabled={imageId === ""}
            >
              Save
            </ButtonCreate>

            <Button
              variant="white"
              onClick={() => navigate(environmentDatabasesUrl(envId))}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Box>
    </EnvironmentDetailLayout>
  );
};
