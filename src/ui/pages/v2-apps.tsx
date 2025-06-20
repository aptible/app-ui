import { useQuery, useSelector } from "@app/react";
import { schema } from "@app/schema";
import { fetchV2Apps } from "@app/v2/app";
import { Loading, tokens } from "../shared";

export function V2AppsPage() {
  const { isInitialLoading } = useQuery(fetchV2Apps());
  const apps = useSelector((s) => schema.v2Apps.selectTableAsList(s));
  if (isInitialLoading) {
    return <Loading />;
  }
  return (
    <div>
      <h1 className={tokens.type.h1}>Apps</h1>
      {apps.map((app) => {
        return <div key={app.id}>{app.handle}</div>;
      })}
    </div>
  );
}
