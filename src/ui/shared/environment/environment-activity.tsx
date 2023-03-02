import { selectOperationsAsList } from "@app/deploy/operation";
import { AppState, OperationStatus } from "@app/types";
import { useSelector } from "react-redux";
import { IconCheckCircle, IconInfo, IconX } from "../icons";
import { tokens } from "../tokens";
import { EnvironmentOperationActivity } from "./environment-operation-activity";

export const IconForResource = (operationStatus: OperationStatus) => {
  if (operationStatus === "succeeded") {
    return <IconCheckCircle color="#00633F" />;
  } else if (operationStatus === "queued" || operationStatus === "running") {
    return <IconInfo color="#4361FF" />;
  }
  return <IconX color="#AD1A1A" />;
};

export const EnvironmentActivity = () => {
  const operations = useSelector((s: AppState) =>
    selectOperationsAsList(s, { limit: 5 }),
  );

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="text-left px-3 py-4" colSpan={2}>
              <span className={tokens.type["small normal lighter"]}>
                Recent Activity
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {operations.map((operation) => (
            <EnvironmentOperationActivity
              key={operation.id}
              operation={operation}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
