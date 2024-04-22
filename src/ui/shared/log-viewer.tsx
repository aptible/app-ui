import { fetchOperationLogs } from "@app/deploy";
import { useApi, useSelector } from "@app/react";
import { schema } from "@app/schema";
import { DeployOperation } from "@app/types";
import { useEffect } from "react";

export const LogLine = ({ text }: { text: string }) => {
  const parts = text.split("-- :");
  if (parts.length === 1) {
    return (
      <div>
        <span className="text-lime">{parts[0]}</span>
      </div>
    );
  }

  const leftPart = parts[0]
    .replace("+0000", "")
    .replace(/\d\d\d\d-\d\d-\d\d/, "")
    .trim();
  const rightPart = parts[1].trim();

  const Type = () => {
    if (leftPart.endsWith("ERROR")) {
      return <span className="text-red-300 break-all">{rightPart}</span>;
    }

    if (leftPart.endsWith("WARN")) {
      return <span className="text-orange-400 break-all">{rightPart}</span>;
    }

    return <span className="text-lime break-all">{rightPart}</span>;
  };

  return (
    <div className="text-sm">
      <span className="text-black-200">{leftPart}: </span>
      <Type />
    </div>
  );
};

const wrapper = "font-mono bg-black p-2 rounded-lg text-black-200 overflow-x";
export const LogViewerText = ({ text }: { text: string }) => {
  return (
    <div className={wrapper}>
      {text.split("\n").map((line, i) => {
        return <LogLine key={`log-${i}`} text={line} />;
      })}
    </div>
  );
};

export const LogViewer = ({ op }: { op: DeployOperation }) => {
  const action = fetchOperationLogs({ id: op.id });
  const loader = useApi(action);
  const data: string = useSelector((s) =>
    schema.cache.selectById(s, { id: action.payload.key }),
  );
  useEffect(() => {
    if (op.status === "succeeded" || op.status === "failed") {
      loader.trigger();
    }
  }, [op.status]);

  if (op.status === "queued" || op.status === "running") {
    return (
      <div className={wrapper}>
        Operation {op.status}, logs will display after operation completes.
      </div>
    );
  }

  if (loader.isInitialLoading) {
    return <div className={wrapper}>Fetching logs...</div>;
  }

  if (!data || typeof data !== "string") {
    return <div className={wrapper}>No data found</div>;
  }

  return <LogViewerText text={data} />;
};
