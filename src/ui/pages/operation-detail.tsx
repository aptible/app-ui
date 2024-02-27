import {
  cancelOpByIdPoll,
  pollOperationById,
  selectOperationById,
} from "@app/deploy";
import { useDispatch, useSelector } from "@app/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { usePoller } from "../hooks";
import { Group, LoadingSpinner, LogViewer } from "../shared";

const cancel = cancelOpByIdPoll();
export const OpDetailPage = () => {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const op = useSelector((s) => selectOperationById(s, { id }));
  const action = useMemo(() => pollOperationById({ id }), [id]);
  const [waiting, setWaiting] = useState(false);

  usePoller({ action, cancel });

  useEffect(() => {
    if (op.status === "queued" || op.status === "running") {
      setWaiting(true);
    }

    if (op.status === "failed" || op.status === "succeeded") {
      dispatch(cancel);
      setWaiting(false);
    }
  }, [op.status]);

  return (
    <div className="py-2">
      <Group variant="horizontal" size="sm" className="items-center">
        <LoadingSpinner show={waiting} />
        <div className="w-full">
          <LogViewer op={op} />
        </div>
      </Group>
    </div>
  );
};
