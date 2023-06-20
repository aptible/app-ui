import { ResourceListView } from "./resource-list-view";
import { Header, TableHead } from "./table";
import { tokens } from "./tokens";

export const EmptyResourcesTable = ({
  titleBar,
  headers,
}: { titleBar: React.ReactNode; headers: Header[] }) => (
  <ResourceListView
    header={titleBar}
    tableHeader={<TableHead headers={headers} />}
    tableBody={
      <tr>
        <td colSpan={headers.length}>
          <p
            className={`${tokens.type["small lighter"]} text-center my-4 w-full`}
          >
            No resources found
          </p>
        </td>
      </tr>
    }
  />
);
