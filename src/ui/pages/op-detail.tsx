import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

import { LogViewer } from "../shared";
import { fetchOperationById, selectOperationById } from "@app/deploy";
import { AppState } from "@app/types";

export const OpDetailPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchOperationById({ id }));
  const op = useSelector((s: AppState) => selectOperationById(s, { id }));
  return (
    <div className="py-2">
      <LogViewer op={op} />
    </div>
  );
};
