import { scopeDesc, scopeTitle } from "@app/deploy";
import { PermissionScope } from "@app/types";
import { IconCheckCircle, IconX } from "./icons";
import { Th } from "./table";
import { Tooltip } from "./tooltip";

export function RoleColHeader({ scope }: { scope: PermissionScope }) {
  return (
    <Th className="w-[100px] text-center">
      <Tooltip text={scopeDesc[scope]}>{scopeTitle[scope]} </Tooltip>
    </Th>
  );
}

export function PermCheck({ checked }: { checked: boolean }) {
  if (checked) {
    return <IconCheckCircle className="inline-block" color="#00633F" />;
  }
  return <IconX className="inline-block" color="#AD1A1A" />;
}
