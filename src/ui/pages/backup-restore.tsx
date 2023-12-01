import { fileDateTime, prettyDateTime } from "@app/date";
import {
  RestoreBackupProps,
  fetchBackup,
  fetchDatabase,
  restoreBackup,
  selectBackupById,
  selectDatabaseById,
  selectEnvironmentById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { databaseBackupsUrl, environmentActivityUrl } from "@app/routes";
import { handleValidator } from "@app/validator";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useValidator } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  BannerMessages,
  Box,
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
  const backup = useSelector((s) => selectBackupById(s, { id }));
  const db = useSelector((s) =>
    selectDatabaseById(s, { id: backup.databaseId }),
  );
  useQuery(fetchBackup({ id }));
  useQuery(fetchDatabase({ id: backup.databaseId }));
  const env = useSelector((s) =>
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
    const dt = fileDateTime(backup.createdAt);
    const tmpName = `${db.handle}-at-${dt}`.slice(0, 64);
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
    <AppSidebarLayout>
      <h2 className={tokens.type.h2}>Restore Database from Backup</h2>
      <Box className="mt-3">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <p>
              This will create a new database.{" "}
              <strong>It does not overwrite your existing database.</strong>
            </p>
            <div className="mt-4">
              <div className="text-md font-semibold text-gray-900 block">
                Source Backup
              </div>
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
            Restore Database
          </ButtonCreate>
        </form>
      </Box>
    </AppSidebarLayout>
  );
};
