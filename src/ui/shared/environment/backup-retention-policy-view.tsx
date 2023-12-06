import {
  UpdateBackupRp,
  fetchBackupRp,
  selectLatestBackupRpByEnvId,
  updateBackupRp,
} from "@app/deploy";
import { useLoader, useQuery } from "@app/fx";
import type { AppState } from "@app/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Group, IconEdit } from "..";
import { useValidator } from "../../hooks";
import { BannerMessages } from "../banner";
import { Box } from "../box";
import { Button, ButtonAdmin } from "../button";
import { FormGroup } from "../form-group";
import { Input } from "../input";
import { Radio, RadioGroup } from "../select";
import { tokens } from "../tokens";

const validators = {
  daily: (data: UpdateBackupRp) => {
    const txt = "Number of daily backups";
    const value = data.daily;

    if (isNaN(value)) {
      return `${txt} must be a number`;
    }
    if (value <= 0) {
      return `${txt} backups must be > 0`;
    }
    if (value % 1 !== 0) {
      return `${txt} must be whole number`;
    }
  },
  monthly: (data: UpdateBackupRp) => {
    const txt = "Number of monthly backups";
    const value = data.monthly;

    if (isNaN(value)) {
      return `${txt} must be a number`;
    }
    if (value < 0) {
      return `${txt} must be >= 0`;
    }
    if (value % 1 !== 0) {
      return `${txt} must be whole number`;
    }
  },
  yearly: (data: UpdateBackupRp) => {
    const txt = "Number of yearly backups";
    const value = data.yearly;

    if (isNaN(value)) {
      return `${txt} must be a number`;
    }
    if (value < 0) {
      return `${txt} must be >= 0`;
    }
    if (value % 1 !== 0) {
      return `${txt} must be whole number`;
    }
  },
};

export const BackupRpView = ({ envId }: { envId: string }) => {
  useQuery(fetchBackupRp({ envId }));
  const backupRp = useSelector((s: AppState) =>
    selectLatestBackupRpByEnvId(s, { envId }),
  );
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <Box>
        <Group>
          <Group size="xs">
            <div>
              <strong>Daily backups retained:</strong> {backupRp.daily}
            </div>
            <div>
              <strong>Monthly backups retained:</strong> {backupRp.monthly}
            </div>
            <div>
              <strong>Yearly backups retained:</strong> {backupRp.yearly}
            </div>
            <div>
              <strong>Copy backups to another region:</strong> {backupRp.makeCopy ? "Yes" : "No"}
            </div>
            <div>
              <strong>Keep final backups:</strong> {backupRp.keepFinal ? "Yes" : "No"}
            </div>
          </Group>

          <div>
            <ButtonAdmin
              envId={envId}
              onClick={() => setEditing(true)}
              variant="white"
              type="button"
            >
              <IconEdit variant="sm" className="mr-2" />
              Edit Backup Retention Policy
            </ButtonAdmin>
          </div>
        </Group>
      </Box>
    );
  }

  return <BackupRpEditor envId={envId} onClose={() => setEditing(false)} />;
};

export const BackupRpEditor = ({
  envId,
  onClose,
}: { envId: string; onClose: () => void }) => {
  const dispatch = useDispatch();
  useQuery(fetchBackupRp({ envId }));
  const backupRp = useSelector((s: AppState) =>
    selectLatestBackupRpByEnvId(s, { envId }),
  );
  const [daily, setDaily] = useState(backupRp.daily);
  const [monthly, setMonthly] = useState(backupRp.monthly);
  const [yearly, setYearly] = useState(backupRp.yearly);
  const [makeCopy, setMakeCopy] = useState(backupRp.makeCopy ? "yes" : "no");
  const [keepFinal, setKeepFinal] = useState(backupRp.keepFinal ? "yes" : "no");
  const [errors, validate] = useValidator<UpdateBackupRp, typeof validators>(
    validators,
  );
  const data: UpdateBackupRp = {
    daily,
    monthly,
    yearly,
    makeCopy: makeCopy === "yes",
    keepFinal: keepFinal === "yes",
    id: backupRp.id,
    envId,
  };
  const action = updateBackupRp(data);
  const loader = useLoader(action);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  const onReset = () => {
    setDaily(backupRp.daily);
    setMonthly(backupRp.monthly);
    setYearly(backupRp.yearly);
    setMakeCopy(backupRp.makeCopy ? "yes" : "no");
    setKeepFinal(backupRp.keepFinal ? "yes" : "no");
  };

  useEffect(() => {
    onReset();
  }, [backupRp]);

  return (
    <Box>
      <h3 className={tokens.type.h3}>Backup Retention Policy</h3>
      <div className="mt-4">
        Any changes made will impact <strong>all database backups</strong>{" "}
        inside this Environment.
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 mt-4">
        <div className="grid md:grid-cols-2 col-span-1 gap-4">
          <FormGroup
            label="Daily backups retained"
            htmlFor="daily"
            feedbackMessage={errors.daily}
            feedbackVariant={errors.daily ? "danger" : "info"}
          >
            <Input
              id="daily"
              type="number"
              value={daily}
              onChange={(e) => setDaily(parseInt(e.currentTarget.value))}
            />
          </FormGroup>

          <FormGroup
            label="Monthly backups retained"
            htmlFor="monthly"
            feedbackMessage={errors.monthly}
            feedbackVariant={errors.monthly ? "danger" : "info"}
          >
            <Input
              id="monthly"
              type="number"
              value={monthly}
              onChange={(e) => {
                setMonthly(parseInt(e.currentTarget.value));
              }}
            />
          </FormGroup>

          <FormGroup
            label="Yearly backups retained"
            htmlFor="yearly"
            feedbackMessage={errors.yearly}
            feedbackVariant={errors.yearly ? "danger" : "info"}
          >
            <Input
              id="yearly"
              type="number"
              value={yearly}
              onChange={(e) => {
                setYearly(parseInt(e.currentTarget.value));
              }}
            />
          </FormGroup>

          <div />

          <FormGroup label="Copy backups to another region" htmlFor="make-copy">
            <RadioGroup
              name="make-copy"
              selected={makeCopy}
              onSelect={(inp) => setMakeCopy(inp)}
            >
              <Radio value="yes">Yes</Radio>
              <Radio value="no">No</Radio>
            </RadioGroup>
          </FormGroup>

          <FormGroup label="Keep final backup" htmlFor="keep-final">
            <RadioGroup
              name="keep-final"
              selected={keepFinal}
              onSelect={(inp) => setKeepFinal(inp)}
            >
              <Radio value="yes">Yes</Radio>
              <Radio value="no">No</Radio>
            </RadioGroup>
          </FormGroup>
        </div>

        <hr className="my-2" />

        <BannerMessages {...loader} />

        <div className="flex gap-2">
          <ButtonAdmin type="submit" envId={envId} isLoading={loader.isLoading}>
            Save Policy
          </ButtonAdmin>
          <Button type="button" onClick={onClose} variant="white">
            Cancel
          </Button>
        </div>
      </form>
    </Box>
  );
};
