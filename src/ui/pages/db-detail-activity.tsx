import { useEffect } from "react";
import { useParams } from "react-router";
import { useCache } from "saga-query/react";

import { fetchDatabaseOperations } from "@app/deploy";
import type { DeployOperationResponse, HalEmbedded } from "@app/types";

import { EmptyResources, LoadResources } from "../shared";

interface HalOperations {
	operations: DeployOperationResponse[];
}

export const DatabaseActivityPage = () => {
	const { id = "" } = useParams();
	const query = useCache<HalEmbedded<HalOperations>>(
		fetchDatabaseOperations({ id }),
	);

	useEffect(() => {
		query.trigger();
	}, []);

	if (!query.data) {
		return <EmptyResources />;
	}

	const { operations } = query.data._embedded;

	return (
		<LoadResources query={query} isEmpty={operations.length === 0}>
			{operations.map((op) => (
				<div key={op.id}>
					{op.type} {op.status} {op.user_name} {op.updated_at}
				</div>
			))}
		</LoadResources>
	);
};
