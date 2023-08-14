import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useLoader, useLoaderSuccess, useQuery } from "saga-query/react";

import { prettyDateTime, prettyDateTimeForBackups } from "@app/date";
import {
  RestoreBackupProps,
  fetchBackup,
  fetchDatabase,
  restoreBackup,
  selectBackupById,
  selectDatabaseById,
  selectEnvironmentById,
} from "@app/deploy";
import { databaseBackupsUrl, environmentActivityUrl } from "@app/routes";
import { AppState } from "@app/types";
import { handleValidator } from "@app/validator";

import { useValidator } from "../hooks";
import { MenuWrappedPage } from "../layouts";
import {
  BannerMessages,
  ButtonCreate,
  DatabaseNameInput,
  EnvironmentSelect,
  FormGroup,
  SelectOption,
  tokens,
} from "../shared";

const validators = {
  handle: (props: RestoreBackupProps) => handleValidator(props.handle),
};

export const BackupRestorePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const backup = useSelector((s: AppState) => selectBackupById(s, { id }));
  const db = useSelector((s: AppState) =>
    selectDatabaseById(s, { id: backup.databaseId }),
  );
  useQuery(fetchBackup({ id }));
  useQuery(fetchDatabase({ id: backup.databaseId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: backup.environmentId }),
  );
  const defaultValue = {
    label: env.handle,
    value: env.id,
  };
  const [name, setName] = useState("");
  const [inpEnv, setInpEnv] = useState(backup.environmentId);
  const [errors, validate] = useValidator<
    RestoreBackupProps,
    typeof validators
  >(validators);
  const data = {
    id: backup.id,
    handle: name,
    destEnvId: inpEnv,
  };
  const action = restoreBackup(data);
  const loader = useLoader(action);

  useEffect(() => {
    setInpEnv(backup.environmentId);
  }, [backup.environmentId]);

  useEffect(() => {
    const tmpName = `${db.handle}-at-${prettyDateTimeForBackups(
      backup.createdAt,
    )}`.slice(0, 64);
    setName(tmpName);
  }, [db.handle, backup.createdAt]);

  const onSelect = (opt: SelectOption) => {
    setInpEnv(opt.value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    navigate(environmentActivityUrl(inpEnv));
  });

  return (
    <MenuWrappedPage>
      <div className="bg-white py-8 px-8 shadow border border-black-100 rounded-lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <h2 className={tokens.type.h2}>Create Database from Backup</h2>

            <div>
              <Link to={databaseBackupsUrl(db.id)}>
                {db.handle} (backup from: {prettyDateTime(backup.createdAt)})
              </Link>
            </div>
          </div>

          <FormGroup label="Environment" htmlFor="env-selector">
            <EnvironmentSelect
              onSelect={onSelect}
              defaultValue={defaultValue.value}
            />
          </FormGroup>

          <DatabaseNameInput
            value={name}
            onChange={(n) => setName(n)}
            feedbackMessage={errors.handle}
            feedbackVariant={errors.handle ? "danger" : "info"}
          />

          <BannerMessages {...loader} />

          <ButtonCreate
            className="w-[200px]"
            type="submit"
            envId={inpEnv}
            isLoading={loader.isLoading}
          >
            Create Database
          </ButtonCreate>
        </form>
      </div>
    </MenuWrappedPage>
  );
};
