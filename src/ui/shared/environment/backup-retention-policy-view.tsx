import {
  type UpdateBackupRp,
  fetchBackupRp,
  selectLatestBackupRpByEnvId,
  updateBackupRp,
} from "@app/deploy";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import { useEffect, useState } from "react";
import { useValidator } from "../../hooks";
import { Banner, BannerMessages } from "../banner";
import { Box } from "../box";
import { Button, ButtonAdmin } from "../button";
import { FormGroup } from "../form-group";
import { Group } from "../group";
import { IconEdit } from "../icons";
import { Input } from "../input";
import { KeyValueGroup } from "../key-value";
import { Radio, RadioGroup } from "../select";
import { tokens } from "../tokens";

const validators = {
  daily: (data: UpdateBackupRp) => {
    const txt = "Number of daily backups";
    const value = data.daily;

    if (Number.isNaN(value)) {
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

    if (Number.isNaN(value)) {
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

    if (Number.isNaN(value)) {
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
  const backupRp = useSelector((s) =>
    selectLatestBackupRpByEnvId(s, { envId }),
  );
  const [editing, setEditing] = useState(false);
  const data = [
    { key: "Daily backups retained", value: backupRp.daily },
    { key: "Monthly backups retained", value: backupRp.monthly },
    { key: "Yearly backups retained", value: backupRp.yearly },
    {
      key: "Copy backups to another region",
      value: backupRp.makeCopy ? "Yes" : "No",
    },
    {
      key: "Keep final backup for deprovisioned databases",
      value: backupRp.keepFinal ? "Yes" : "No",
    },
  ];

  if (!editing) {
    return (
      <Box>
        <Group>
          <h3 className={tokens.type.h3}>Backup Retention Policy</h3>
          <div className="w-[370px]">
            <KeyValueGroup data={data} />
          </div>

          <div>
            <ButtonAdmin
              envId={envId}
              onClick={() => setEditing(true)}
              variant="white"
              type="button"
            >
              <IconEdit variant="sm" className="mr-2" />
              Edit Policy
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
  const backupRp = useSelector((s) =>
    selectLatestBackupRpByEnvId(s, { envId }),
  );
  const [daily, setDaily] = useState(backupRp.daily);
  const [monthly, setMonthly] = useState(backupRp.monthly);
  const [yearly, setYearly] = useState(backupRp.yearly);
  const [makeCopy, setMakeCopy] = useState(backupRp.makeCopy ? "yes" : "no");
  const [keepFinal, setKeepFinal] = useState(backupRp.keepFinal ? "yes" : "no");
  const [reduced, setReduced] = useState(false);
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
  const loader = useLoader(updateBackupRp);

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

  useEffect(() => {
    setReduced(
      daily < backupRp.daily ||
        monthly < backupRp.monthly ||
        yearly < backupRp.yearly ||
        (makeCopy === "no" && backupRp.makeCopy) ||
        (keepFinal === "no" && backupRp.keepFinal),
    );
  }, [backupRp, daily, monthly, yearly, makeCopy, keepFinal]);

  return (
    <Box>
      <Group>
        <h3 className={tokens.type.h3}>Backup Retention Policy</h3>

        <BannerMessages {...loader} />

        <div>
          <p>
            Any changes made will impact <strong>all database backups</strong>{" "}
            inside this Environment.
          </p>
          <p>
            Recommendations for production environments: Daily: 14-30, Monthly:
            12, Yearly: 5, Copy backups: Yes (depending on DR needs), Keep final
            backups: Yes
          </p>
          <p>
            Recommendations for non-production environments: Daily: 1-14,
            Monthly: 0, Yearly: 0, Copy backups: No, Keep final backups: No
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <div className="grid md:grid-cols-3 col-span-1 gap-4">
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
                onChange={(e) =>
                  setDaily(Number.parseInt(e.currentTarget.value))
                }
              />
              <p className="text-sm mt-1 text-black">
                Number of daily backups (taken every 24 hours) retained
              </p>
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
                  setMonthly(Number.parseInt(e.currentTarget.value));
                }}
              />
              <p className="text-sm mt-1 text-black">
                Number of monthly backups (last backup of each month) retained
              </p>
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
                  setYearly(Number.parseInt(e.currentTarget.value));
                }}
              />
              <p className="text-sm mt-1 text-black">
                Number of yearly backups (last backup of each year) retained
              </p>
            </FormGroup>

            <FormGroup
              label="Copy backups to another region"
              htmlFor="make-copy"
            >
              <RadioGroup
                name="make-copy"
                selected={makeCopy}
                onSelect={(inp) => setMakeCopy(inp)}
              >
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </RadioGroup>
              <p className="text-sm mt-1 text-black">
                When enabled, Aptible will copy all the backups within that
                Environment to another region
              </p>
            </FormGroup>

            <FormGroup
              label="Keep final backup for deprovisioned databases"
              htmlFor="keep-final"
            >
              <RadioGroup
                name="keep-final"
                selected={keepFinal}
                onSelect={(inp) => setKeepFinal(inp)}
              >
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </RadioGroup>
              <p className="text-sm mt-1 text-black">
                When enabled, Aptible will retain the last backup of a Database
                after you deprovision it
              </p>
            </FormGroup>
          </div>

          <hr className="my-2" />

          {reduced ? (
            <Banner variant="warning">
              Warning: Reducing the number of retained backups, including
              disabling copies or final backups, will automatically delete
              existing, automated backups that do not match the new policy. This
              may result in the permanent loss of backup data and could violate
              your organization's internal compliance controls.
            </Banner>
          ) : null}

          <div className="flex gap-2">
            <ButtonAdmin
              type="submit"
              envId={envId}
              isLoading={loader.isLoading}
            >
              Save Policy
            </ButtonAdmin>
            <Button type="button" onClick={onClose} variant="white">
              Cancel
            </Button>
          </div>
        </form>
      </Group>
    </Box>
  );
};
