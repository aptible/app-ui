import { prettyDateRelative } from "@app/date";
import { selectEnvironments } from "@app/deploy";
import { selectOperationsAsList } from "@app/deploy/operation";
import { capitalize } from "@app/string-utils";
import { AppState, OperationStatus } from "@app/types";
import { useSelector } from "react-redux";
import { IconCheckCircle, IconInfo, IconXCircle } from "../icons";
import { Td } from "../table";
import { tokens } from "../tokens";
import { EnvironmentOperationActivity } from "./environment-operation-activity";

export const IconForResource = (operationStatus: OperationStatus) => {
  if (operationStatus === "succeeded") {
    return <IconCheckCircle color="#00633F" />;
  } else if (operationStatus === "queued" || operationStatus === "running") {
    return <IconInfo color="#4361FF" />;
  }
  return <IconXCircle color="#AD1A1A" />;
};

export const EnvironmentActivity = () => {
  const operations = useSelector((s: AppState) =>
    selectOperationsAsList(s, { limit: 5 }),
  );

  return (
    <div className="mt-6 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="text-left px-4 py-4" colSpan={2}>
                    <span className={tokens.type["small normal lighter"]}>
                      Recent Activity
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {operations.map((operation) => (
                  <EnvironmentOperationActivity operation={operation} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
