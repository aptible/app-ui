import type { User } from "@app/types";

import { Button } from "../button";
import { IconPlusCircle } from "../icons";
import { InputSearch } from "../input";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";

const UserListRow = ({ user }: { user: User }) => {
  return (
    <tr className="group hover:bg-gray-50">
      <Td className="flex-1">
        <div className={tokens.type.darker}>{user.name}</div>
        <div className={tokens.type["normal lighter"]}>{user.email}</div>
      </Td>
      <Td className="flex-1">
        <div className={tokens.type["normal lighter"]}>
          {user.otpEnabled ? "Enabled" : "Disabled"}
        </div>
      </Td>
      <Td>
        <span className="flex gap-2 justify-end mr-4">
          <Button type="submit" size="sm">
            Edit
          </Button>
        </span>
      </Td>
    </tr>
  );
};

const FilterBarView = () => {
  return (
    <InputSearch placeholder="Search users..." search="" onChange={() => {}} />
  );
};

export const TeamListView = ({ users }: { users: User[] }) => {
  return (
    <ResourceListView
      header={
        <ResourceHeader
          title="Team Settings"
          actions={[
            <Button type="button" variant="primary">
              <IconPlusCircle variant="sm" className="mr-2" />
              Invite Users
            </Button>,
          ]}
          filterBar={<FilterBarView />}
        />
      }
      tableHeader={
        <TableHead
          rightAlignedFinalCol
          headers={["User", "MFA Status", "Actions"]}
        />
      }
      tableBody={
        <>
          {users.map((user) => (
            <UserListRow user={user} key={user.id} />
          ))}
        </>
      }
    />
  );
};
