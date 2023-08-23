import cn from "classnames";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { selectOrganizationSelected } from "@app/organizations";
import { orgPickerUrl } from "@app/routes";
import { selectCurrentUser } from "@app/users";

import { IconWorkplace } from "./icons";

export const OrgPicker = () => {
  const navigate = useNavigate();
  const org = useSelector(selectOrganizationSelected);
  const user = useSelector(selectCurrentUser);

  return (
    <div
      onClick={() => navigate(orgPickerUrl())}
      onKeyUp={() => navigate(orgPickerUrl())}
      className={cn([
        "border border-gray-200 bg-white rounded-lg cursor-pointer",
        "px-2 py-1",
        "flex items-center",
        "hover:bg-black-50",
      ])}
    >
      <IconWorkplace
        className="p-1 mr-2 border border-black-100 rounded-md"
        variant="lg"
      />
      <div>
        <div className="text-black">{org.name.slice(0, 20)}</div>
        <div className="text-gray-500 text-sm -mt-1">
          {user.name.slice(0, 20)}
        </div>
      </div>
    </div>
  );
};
