import { createDatabaseOperation, selectDatabaseById } from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { databaseActivityUrl, environmentBackupsUrl } from "@app/routes";
import { useNavigate, useParams } from "react-router";
import { usePaginatedBackupsByDatabaseId } from "../hooks";
import {
  Banner,
  BannerMessages,
  ButtonLink,
  ButtonOps,
  DatabaseBackupsList,
  Group,
  IconEdit,
  IconPlusCircle,
} from "../shared";

export const DatabaseBackupsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const paginated = usePaginatedBackupsByDatabaseId(id);
  const db = useSelector((s) => selectDatabaseById(s, { id }));
  const backupAction = createDatabaseOperation({ type: "backup", dbId: id });
  const loader = useLoader(backupAction);

  const onCreateBackup = () => {
    dispatch(backupAction);
  };

  useLoaderSuccess(loader, () => {
    navigate(databaseActivityUrl(id));
  });

  return (
    <Group>
      <Banner variant="info">
        <p className="">
          <strong>Deleting Copies of Backups: </strong>Removing an original
          backup deletes all its copies, but deleting a copy does not affect the
          original —{" "}
          <a
            href=" https://www.aptible.com/docs/core-concepts/managed-databases/managing-databases/database-backups"
            target="_blank"
            rel="noreferrer"
          >
            view documentation.
          </a>
        </p>
      </Banner>
      <div className="flex gap-4 items-center">
        <ButtonOps
          envId={db.environmentId}
          onClick={onCreateBackup}
          isLoading={loader.isLoading}
        >
          <IconPlusCircle variant="sm" className="mr-2" /> New Backup
        </ButtonOps>

        <ButtonLink
          to={environmentBackupsUrl(db.environmentId)}
          variant="white"
        >
          <IconEdit variant="sm" className="mr-2" /> Edit Environment Backup
          Policy
        </ButtonLink>
      </div>

      <BannerMessages className="my-4" {...loader} />

      <DatabaseBackupsList paginated={paginated} showDatabase={false} />
    </Group>
  );
};
