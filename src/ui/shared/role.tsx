import {
  hasExplicitPerm,
  hasInheritedPerm,
  scopeDesc,
  scopeTitle,
} from "@app/deploy";
import { useSelector } from "@app/react";
import { schema } from "@app/schema";
import type { Permission, PermissionScope } from "@app/types";
import { IconCheckCircle, IconX } from "./icons";
import { Th } from "./table";
import { Tooltip } from "./tooltip";

export function RoleColHeader({ scope }: { scope: PermissionScope }) {
  return (
    <Th className="w-[100px] text-center">
      <Tooltip className="flex justify-evenly" text={scopeDesc[scope]}>
        {scopeTitle[scope]}{" "}
      </Tooltip>
    </Th>
  );
}

export function PermCheck({
  perm,
  isOwnerRole = false,
}: { perm: Permission; isOwnerRole?: boolean }) {
  const inheritedPerm = useSelector((s) =>
    schema.permissions.selectById(s, { id: perm.inheritedFrom }),
  );

  // override mechanism since owner roles has all perms enabled
  if (isOwnerRole) {
    return (
      <Tooltip
        className="flex justify-evenly"
        fluid
        text="Inherited from Owner Role permissions"
      >
        <IconCheckCircle
          className="inline-block"
          color="#4361FF"
          title="Owner Check"
        />
      </Tooltip>
    );
  }

  if (hasExplicitPerm(perm)) {
    return (
      <IconCheckCircle
        className="inline-block"
        color="#00633F"
        title={`${scopeTitle[perm.scope]} Check`}
      />
    );
  }

  if (hasInheritedPerm(perm)) {
    return (
      <Tooltip
        className="flex justify-evenly"
        fluid
        text={`Inherited from "${scopeTitle[inheritedPerm.scope]}" permission`}
      >
        <IconCheckCircle
          className="inline-block"
          color="#4361FF"
          title={`${scopeTitle[perm.scope]} Check`}
        />
      </Tooltip>
    );
  }

  return (
    <IconX
      className="inline-block"
      color="#AD1A1A"
      title={`${scopeTitle[perm.scope]} Denied`}
    />
  );
}
