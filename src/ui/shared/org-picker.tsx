import cn from "classnames";

import { IconWorkplace } from "./icons";
import { selectOrganizationSelected } from "@app/organizations";
import { selectCurrentUser } from "@app/users";
import { useSelector } from "react-redux";

export const OrgPicker = () => {
  const org = useSelector(selectOrganizationSelected);
  const user = useSelector(selectCurrentUser);
  return (
    <div
      className={cn([
        "border border-gray-200 bg-white rounded-lg",
        "px-2 py-1",
        "flex items-center",
      ])}
    >
      <IconWorkplace
        className="p-1 mr-2 border border-black-100 rounded-md"
        variant="lg"
      />
      <div>
        <div className="text-black">{org.name.slice(0, 20)}</div>
        <div className="text-gray-500 text-sm">{user.name.slice(0, 20)}</div>
      </div>
    </div>
  );
};
