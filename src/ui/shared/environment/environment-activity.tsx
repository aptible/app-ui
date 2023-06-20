import { useSelector } from "react-redux";

import { selectOperationsAsList } from "@app/deploy/operation";
import { AppState } from "@app/types";

import { tokens } from "../tokens";
import { EnvironmentOperationActivity } from "./environment-operation-activity";

export const EnvironmentActivity = () => {
  const operations = useSelector((s: AppState) =>
    selectOperationsAsList(s, { limit: 5 }),
  );

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
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
