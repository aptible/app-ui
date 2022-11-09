import { useSelector } from "react-redux";
import { useQuery } from "saga-query/react";

import { fetchStacks, selectStacksAsOptions } from "@app/deploy";

import { Loading } from "./loading";
import { EmptyResources, ErrorResources } from "./load-resources";
import { SelectMenu } from "./select-menu";

export const StackSelect = () => {
	const { isInitialLoading, isError, message } = useQuery(fetchStacks());
	const options = useSelector(selectStacksAsOptions);

	if (isInitialLoading) {
		return <Loading />;
	}

	if (isError) {
		return <ErrorResources message={message} />;
	}

	if (options.length === 0) {
		return <EmptyResources />;
	}

	return <SelectMenu name="Stack" options={options} />;
};
