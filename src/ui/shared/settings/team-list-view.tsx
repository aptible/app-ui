import type { User } from "@app/types";

import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { Input } from "../input";
import { Button } from "../button";
import { tokens } from "../tokens";
import { IconSearch } from "../icons";

const UserListRow = ({ user }: { user: User }) => {
  return (
    <tr>
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
    <div className="flex flex-1 pt-4 gap-3 relative m-1">
      <IconSearch className="absolute inline-block top-6 left-1.5" />
      <Input
        placeholder="Search Users..."
        type="text"
        className="search-bar pl-8"
      />
    </div>
  );
};

export const TeamListView = ({ users }: { users: User[] }) => {
  return (
    <ResourceListView
      title="Team"
      description="Users represent individual or robots with access to your Aptible Organization. Users can be added to Roles in order to grant them permissions."
      filterBar={<FilterBarView />}
      actions={[
        <Button type="button" variant="primary">
          Invite Users
        </Button>,
      ]}
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
