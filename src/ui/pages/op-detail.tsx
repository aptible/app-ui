import {
  cancelOpByIdPoll,
  pollOperationById,
  selectOperationById,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { batchActions } from "redux-batched-actions";
import { LogViewer } from "../shared";

const cancel = cancelOpByIdPoll();
export const OpDetailPage = () => {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const op = useSelector((s: AppState) => selectOperationById(s, { id }));
  const action = pollOperationById({ id });

  useEffect(() => {
    dispatch(batchActions([cancel, action]));
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
