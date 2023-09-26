import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  UpdateBackupRp,
  fetchBackupRp,
  selectLatestBackupRpByEnvId,
  updateBackupRp,
} from "@app/deploy";
import { useLoader, useQuery } from "@app/fx";
import type { AppState } from "@app/types";

import { useValidator } from "../../hooks";
import { BannerMessages } from "../banner";
import { Box } from "../box";
import { Button, ButtonAdmin, ButtonDestroy } from "../button";
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
};

export const BackupRpView = ({ envId }: { envId: string }) => {
  const dispatch = useDispatch();
  useQuery(fetchBackupRp({ envId }));
  const backupRp = useSelector((s: AppState) =>
    selectLatestBackupRpByEnvId(s, { envId }),
  );
  const [daily, setDaily] = useState(backupRp.daily);
  const [monthly, setMonthly] = useState(backupRp.monthly);
  const [makeCopy, setMakeCopy] = useState(backupRp.makeCopy ? "yes" : "no");
  const [keepFinal, setKeepFinal] = useState(backupRp.keepFinal ? "yes" : "no");
  const [errors, validate] = useValidator<UpdateBackupRp, typeof validators>(
    validators,
  );
  const data: UpdateBackupRp = {
    daily,
    monthly,
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

        <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <ButtonAdmin type="submit" envId={envId} isLoading={loader.isLoading}>
            Save Policy
          </ButtonAdmin>

          <Button variant="white" onClick={onReset}>
            Cancel
          </Button>
        </div>
        <div className="flex justify-end">
          <ButtonDestroy
              variant="delete"
              className="w-70"
              type="submit"
              requireConfirm
            >
              Delete All Backups
            </ButtonDestroy>
          </div>
          </div>
      </form>
    </Box>
  );
};
