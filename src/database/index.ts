import { capitalize } from "@app/string-utils";

export const formatDatabaseType = (type: string, version: string) => {
  return `${capitalize(type)} ${version}`;
};
