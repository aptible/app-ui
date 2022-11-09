import { useQuery } from "saga-query/react";
import { useSelector } from "react-redux";

import { fetchApps, fetchEnvironments, selectAppsAsList } from "@app/deploy";

import { LoadResources } from "../../shared";

import { AppListView } from "./app-list-view";

export function AppList() {
	const query = useQuery(fetchApps());
	useQuery(fetchEnvironments());
	const apps = useSelector(selectAppsAsList);

	return (
		<LoadResources query={query} isEmpty={apps.length === 0}>
			<AppListView apps={apps} />
		</LoadResources>
	);
}
