import { useEffect } from "react";
import { useParams } from "react-router";
import { useCache } from "saga-query/react";

import { fetchAppOperations } from "@app/deploy";
import type { DeployOperationResponse, HalEmbedded } from "@app/types";

import { EmptyResources, Loading, LoadResources, TableHead } from "../shared";
import { ResourceListView } from "../shared/resource-list-view";
import { OperationListRow } from "../shared/operation-list-row";

interface HalOperations {
  operations: DeployOperationResponse[];
}

export const AppActivityPage = () => {
  const { id = "" } = useParams();
  const query = useCache<HalEmbedded<HalOperations>>(
    fetchAppOperations({ id }),
  );

  useEffect(() => {
    query.trigger();
  }, []);

  if (query.isInitialLoading) {
    return <Loading />;
  }

  if (!query.data) {
    return <EmptyResources />;
  }

  const { operations } = query.data._embedded;

  return (
    <div className="mt-4">
      <LoadResources query={query} isEmpty={operations.length === 0}>
        <ResourceListView
          tableHeader={
            <TableHead
              headers={[
                "Time",
                "Operation",
                "View Logs in CLI",
                "Download Logs",
              ]}
            />
          }
          tableBody={
            <>
              {operations.map((operation) => (
                <OperationListRow operation={operation} key={operation.id} />
              ))}
            </>
          }
        />
      </LoadResources>
    </div>
  );
};
