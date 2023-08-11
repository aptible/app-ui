import { useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLoader, useLoaderSuccess, useQuery } from "saga-query/react";

import {
  DbCreatorProps,
  fetchAllDatabaseImages,
  provisionDatabaseList,
  selectDatabaseImagesAsList,
  selectEnvironmentById,
} from "@app/deploy";
import { environmentActivityUrl, environmentDatabasesUrl } from "@app/routes";
import { AppState } from "@app/types";

import { EnvironmentDetailLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Button,
  ButtonCreate,
  DatabaseCreatorForm,
  DbCreatorReducer,
  DbValidatorError,
  dbSelectorReducer,
  validateDbName,
} from "../shared";
import { generateHash } from "@app/id";

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
  const [params] = useSearchParams();
  const envId = params.get("environment_id") || "";
  const [dbErrors, setDbErrors] = useState<DbValidatorError[]>([]);
  const [dbCreatorMap, dbCreatorDispatch] = useReducer<DbCreatorReducer>(
    dbSelectorReducer,
    {},
  );
  const dbCreatorList = Object.values(dbCreatorMap).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const imgLoader = useQuery(fetchAllDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesAsList);
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );
  const action = provisionDatabaseList({ envId, dbs: dbCreatorList });
  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
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

  return (
    <EnvironmentDetailLayout>
      <form
        onSubmit={onSubmit}
        className="bg-white py-8 px-8 shadow border border-black-100 rounded-lg"
      >
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
    </EnvironmentDetailLayout>
  );
};