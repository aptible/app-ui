import { useParams } from "react-router";
import { useCache } from "saga-query/react";

import { fetchEnvironmentOperations } from "@app/deploy";
import type { DeployOperationResponse, HalEmbedded } from "@app/types";

import {
  EmptyResources,
  LoadResources,
  Loading,
  ResourceListView,
  TableHead,
} from "../shared";
import { OperationListRow } from "../shared/operation-list-row";

interface HalOperations {
  operations: DeployOperationResponse[];
}

export const EnvironmentActivityPage = () => {
  const { id = "" } = useParams();
  const query = useCache<HalEmbedded<HalOperations>>(
    fetchEnvironmentOperations({ id }),
  );

  if (query.isInitialLoading) {
    return <Loading />;
  }

  if (!query.data) {
    return <EmptyResources />;
  }

  const { operations } = query.data._embedded;

  return (
    <div className="my-4">
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
              centerAlignedColIndices={[2, 3]}
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
