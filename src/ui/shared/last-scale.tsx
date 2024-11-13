import { prettyDateTime } from "@app/date";
import {
  cancelServicesOpsPoll,
  getScaleTextFromOp,
  pollServiceOperations,
  selectScaleDiff,
} from "@app/deploy";
import { useLoader, useSelector } from "@app/react";
import { useMemo } from "react";
import { usePoller } from "../hooks";
import { Banner } from "./banner";

export const LastScaleBanner = ({ serviceId }: { serviceId: string }) => {
  const { latest, prev } = useSelector((s) =>
    selectScaleDiff(s, { id: serviceId }),
  );
  const noScaleFound = latest.status === "unknown";
  const latestComplete =
    latest.status === "succeeded" || latest.status === "failed";
  const action = pollServiceOperations({ id: serviceId });
  const loader = useLoader(action);

  const poller = useMemo(() => action, [serviceId]);
  const cancel = useMemo(() => cancelServicesOpsPoll(), []);
  usePoller({ action: poller, cancel });

  const scaleTextCur = getScaleTextFromOp(latest);
  let tail = <span className="font-bold">{scaleTextCur}</span>;
  if (prev.id !== "") {
    const scaleTextPrev = getScaleTextFromOp(prev);
    if (scaleTextPrev !== "") {
      tail = (
        <>
          from <span>{scaleTextPrev}</span>{" "}
          {scaleTextCur !== "" ? (
            <>
              to <span className="font-bold">{scaleTextCur}</span>
            </>
          ) : (
            ""
          )}
        </>
      );
    }
  }

  if (loader.isInitialLoading) {
    return null;
  }

  if (noScaleFound) {
    return null;
  }

  if (!latestComplete) {
    return (
      <Banner variant="progress">
        <span className="font-bold">Scale in Progress</span>{" "}
        {getScaleTextFromOp(latest)}
      </Banner>
    );
  }

  return (
    <Banner variant="info">
      <span className="font-bold">Last Scale:</span>{" "}
      {prettyDateTime(latest.createdAt)} {tail}
    </Banner>
  );
};
