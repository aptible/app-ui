import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import {
  cancelOpByIdPoll,
  pollOperationById,
  selectOperationById,
} from "@app/deploy";
import { AppState } from "@app/types";

import { usePoller } from "../hooks";
import { LogViewer } from "../shared";

export const OpDetailPage = () => {
  const { id = "" } = useParams();
  const action = useMemo(() => pollOperationById({ id }), [id]);
  const cancel = useMemo(() => cancelOpByIdPoll(), []);
  usePoller({ action, cancel });
  const op = useSelector((s: AppState) => selectOperationById(s, { id }));
  return (
    <div className="py-2">
      <LogViewer op={op} />
    </div>
  );
};
