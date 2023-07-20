import type { User } from "@app/types";

import { Button } from "../button";
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
      <Td className="flex gap-2 justify-end w-40">
        <Button type="submit" variant="white" size="xs">
          Edit
        </Button>
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
          title="Team"
          description="Users represent individual or robots with access to your Aptible Organization. Users can be added to Roles in order to grant them permissions."
          actions={[
            <Button type="button" variant="primary">
              Invite Users
            </Button>,
          ]}
          filterBar={<FilterBarView />}
        />
      }
      tableHeader={
        <TableHead
          headers={["User", "MFA Status", { name: "", className: "w-40" }]}
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
