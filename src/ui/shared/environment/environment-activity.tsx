import { prettyDateRelative } from "@app/date";
import { selectEnvironments } from "@app/deploy";
import { selectOperationsAsList } from "@app/deploy/operation";
import { capitalize } from "@app/string-utils";
import { AppState, OperationStatus } from "@app/types";
import { useSelector } from "react-redux";
import { IconCheckCircle, IconInfo, IconXCircle } from "../icons";
import { Td } from "../table";
import { tokens } from "../tokens";

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
    selectOperationsAsList(s),
  ).slice(0, 5);
  const environments = useSelector((s: AppState) => selectEnvironments(s));

  return (
    <div className="mt-6 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                  <tr key={operation.id}>
                    <Td className="py-0 pr-0">
                      {IconForResource(operation.status)}
                    </Td>
                    <Td className="pl-0 2xl:flex-cell-md sm:flex-cell-sm">
                      <span className="font-semibold text-black">
                        {capitalize(operation.resourceType)} {operation.type}{" "}
                        {operation.status}{" "}
                      </span>
                      <span>
                        for{" "}
                        {environments?.[operation.environmentId]?.handle ??
                          "Unknown"}
                      </span>
                      <br />
                      <span style={{ textTransform: "capitalize" }}>
                        {prettyDateRelative(operation.createdAt)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
