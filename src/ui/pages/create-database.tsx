import {
  DbCreatorProps,
  fetchDatabaseImages,
  fetchOperationsByEnvId,
  provisionDatabaseList,
  selectDatabaseImagesVisible,
  selectEnvironmentById,
} from "@app/deploy";
import { clearTimers } from "@app/fx";
import { generateHash } from "@app/id";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { environmentActivityUrl, environmentDatabasesUrl } from "@app/routes";
import { useEffect, useReducer, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EnvironmentDetailLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  ButtonCreate,
  DatabaseCreatorForm,
  DbCreatorReducer,
  DbValidatorError,
  dbSelectorReducer,
  validateDbName,
} from "../shared";
import { EnvSelectorPage } from "./create-env-app";

const validateDbs = (items: DbCreatorProps[]): DbValidatorError[] => {
  const errors: DbValidatorError[] = [];

  const validate = (item: DbCreatorProps) => {
    const name = validateDbName(item);
    if (name) {
      errors.push(name);
    }
  };

  items.forEach(validate);
  return errors;
};

export const CreateDatabasePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const envId = params.get("environment_id") || "";
  const [dbErrors, setDbErrors] = useState<DbValidatorError[]>([]);
  const [dbCreatorMap, dbCreatorDispatch] = useReducer<DbCreatorReducer>(
    dbSelectorReducer,
    {},
  );
  const dbCreatorList = Object.values(dbCreatorMap)
    .sort((a, b) => a.id.localeCompare(b.id))
    .filter((db) => db.imgId !== "");
  const isDisabled = dbCreatorList.length === 0;
  const imgLoader = useQuery(fetchDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesVisible);
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const action = provisionDatabaseList({ envId, dbs: dbCreatorList });
  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
    // dispatch(clearTimers(fetchOperationsByEnvId({ id: envId, page: 1 })));
    navigate(environmentActivityUrl(envId));
  });

  // add a db on mount
  useEffect(() => {
    const payload: DbCreatorProps = {
      id: `${0}`,
      imgId: "",
      name: env.handle,
      env: "DATABASE_URL",
      dbType: "",
      enableBackups: true,
    };
    dbCreatorDispatch({ type: "add", payload });
  }, [env.handle]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dberr = validateDbs(dbCreatorList);
    if (dberr.length > 0) {
      setDbErrors(dberr);
      return;
    }

    setDbErrors([]);
    dispatch(action);
  };

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
            <DatabaseCreatorForm
              dbImages={dbImages}
              namePrefix={`${env.handle}-${generateHash(5)}`}
              dbMap={dbCreatorMap}
              dbDispatch={dbCreatorDispatch}
              isLoading={imgLoader.isInitialLoading}
              showEnv={false}
            />
          </div>

          <hr className="my-4" />

          <div className="mb-4 flex flex-col gap-2">
            {dbErrors.map((err) => {
              return (
                <Banner key={err.item.id} variant="error">
                  {err.message} ({err.item.name})
                </Banner>
              );
            })}
          </div>

          <BannerMessages className="mb-4" {...loader} />

          <div className="flex gap-2">
            <ButtonCreate
              envId={envId}
              type="submit"
              isLoading={loader.isLoading}
              disabled={isDisabled}
            >
              Save Changes
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
