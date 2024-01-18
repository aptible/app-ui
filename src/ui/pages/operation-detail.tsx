import {
  cancelOpByIdPoll,
  pollOperationById,
  selectOperationById,
} from "@app/deploy";
import { useDispatch, useSelector } from "@app/react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { LogViewer } from "../shared";

const cancel = cancelOpByIdPoll();
export const OpDetailPage = () => {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const op = useSelector((s) => selectOperationById(s, { id }));
  const action = pollOperationById({ id });

  useEffect(() => {
    dispatch(cancel);
    dispatch(action);
    return () => {
      dispatch(cancel);
    };
  }, [id]);

  useEffect(() => {
    if (op.status === "failed" || op.status === "succeeded") {
      dispatch(cancel);
    }
  }, [op.status]);

  return (
    <div className="py-2">
      <LogViewer op={op} />
    </div>
  );
};
