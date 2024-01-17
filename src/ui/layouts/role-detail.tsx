import { prettyDate } from "@app/date";
import { useSelector } from "@app/react";
import { roleTypeFormat, selectRoleById } from "@app/roles";
import {
  roleDetailEnvironmentsUrl,
  roleDetailMembersUrl,
  roleDetailSettingsUrl,
  teamRolesUrl,
} from "@app/routes";
import type { Role } from "@app/types";
import { useParams } from "react-router-dom";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";

export function RoleHeader({ role }: { role: Role }) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Role Details"
        docsUrl="https://www.aptible.com/docs/access-permissions"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{role.id}</DetailInfoItem>
        <DetailInfoItem title="Type">{roleTypeFormat(role)}</DetailInfoItem>
        <DetailInfoItem title="Created Date">
          {prettyDate(role.createdAt)}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function RolePageHeader() {
  const { id = "" } = useParams();
  const role = useSelector((s) => selectRoleById(s, { id }));
  const crumbs = [{ name: "Roles", to: teamRolesUrl() }];
  const tabs: TabItem[] = [{ name: "Members", href: roleDetailMembersUrl(id) }];

  if (role.type !== "owner" && role.type !== "platform_owner") {
    tabs.push(
      { name: "Environments", href: roleDetailEnvironmentsUrl(id) },
      { name: "Settings", href: roleDetailSettingsUrl(id) },
    );
  }

  return (
    <DetailPageHeaderView
      isError={false}
      meta={{}}
      message=""
      breadcrumbs={crumbs}
      title={role.name}
      detailsBox={<RoleHeader role={role} />}
      tabs={tabs}
    />
  );
}

export const RoleDetailLayout = ({
  children,
}: { children: React.ReactNode }) => {
  return (
    <div>
      <RolePageHeader />
      {children}
    </div>
  );
};
