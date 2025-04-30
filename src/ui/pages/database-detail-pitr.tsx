import {
  fetchDatabase,
  pitrRestoreDatabase,
  selectDatabaseById,
} from "@app/deploy";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import { environmentDatabasesUrl } from "@app/routes";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useLoaderSuccess } from "starfx/react";
import {
  Button,
  DatabaseNameInput,
  FormGroup,
  Group,
  Input,
  Radio,
  RadioGroup,
} from "../shared";

export const DatabasePitrPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const database = useSelector((s) => selectDatabaseById(s, { id }));
  const [handle, setHandle] = useState("");
  const [recoveryTargetType, setRecoveryTargetType] = useState("time");
  const [recoveryTarget, setRecoveryTarget] = useState(
    DateTime.utc().toFormat("yyyy-MM-dd HH:mm:ss"),
  );

  const data = {
    dbId: id,
    handle,
    recoveryTargetType,
    recoveryTarget,
  };

  const action = pitrRestoreDatabase(data);
  const loader = useLoader(action);

  useLoaderSuccess(loader, () => {
    // On success go back to the database list so the new database can be found
    navigate(environmentDatabasesUrl(database.environmentId));
  });

  useEffect(() => {
    setHandle(`${database.handle}-recovered`);
  }, [database.handle]);

  const onSubmit = () => {
    dispatch(action);
  };

  return (
    <div>
      <Group>
        <div>
          Restore this database to a new database and recover the new database
          to the provided point in time.
        </div>
        <div>
          After clicking "Recover" do not leave this page or the recovery
          process may not complete.
        </div>
        <DatabaseNameInput
          value={handle}
          onChange={setHandle}
          // feedbackMessage={errors.handle}
          // feedbackVariant={errors.handle ? "danger" : "default"}
        />

        <FormGroup label="Recovery Type" htmlFor="target-type">
          <RadioGroup
            name="target-type"
            selected={recoveryTargetType}
            onSelect={setRecoveryTargetType}
          >
            <Radio value="time">Time</Radio>
            <Radio value="latest">Latest</Radio>
          </RadioGroup>
        </FormGroup>

        {recoveryTargetType === "time" ? (
          <FormGroup
            label="Recovery Target Time"
            htmlFor="target-time"
            feedbackMessage="Time in UTC"
          >
            <Input
              className="max-w-xs"
              name="target-time"
              value={recoveryTarget}
              onChange={(e) => setRecoveryTarget(e.currentTarget.value)}
            />
          </FormGroup>
        ) : null}
        <div>
          <Button disabled={loader.isLoading} onClick={onSubmit}>
            Recover
          </Button>
        </div>
      </Group>
    </div>
  );
};
