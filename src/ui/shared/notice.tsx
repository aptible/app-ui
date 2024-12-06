import { readNotice } from "@app/notice";
import { NoticeType } from "@app/types";
import { useDispatch } from "starfx/react";
import { Box } from "./box";
import { Button } from "./button";
import { ExternalLink } from "./external-link";
import { Group } from "./group";
import { IconInfo } from "./icons";
import { tokens } from "./tokens";

export function NoticeBackupRpBanner() {
  const dispatch = useDispatch();
  const gotit = () => {
    dispatch(readNotice(NoticeType.BackupRPNotice));
  };

  return (
    <Box bg="gray-50">
      <Group>
        <h4 className={`${tokens.type.h4} flex gap-2 items-center`}>
          <IconInfo variant="sm" />
          New Backup Retention Policy
        </h4>
        <p>
          As of <span className="font-bold">07/25/2024</span>, we've changed the
          default backup retention policy for newly created environments to:
        </p>
        <ul className="list-disc list-inside">
          <li>30 daily</li>
          <li>12 monthly</li>
          <li>6 yearly</li>
          <li>Cross-Region copy: disabled</li>
          <li>Keep Final backup: enabled</li>
        </ul>
        <p>
          For more information,{" "}
          <ExternalLink href="https://www.aptible.com/changelog/new-default-backup-retention-policy">
            read the changelog.
          </ExternalLink>
        </p>
        <div>
          <Button key="gotit" variant="primary" onClick={gotit}>
            Got it!
          </Button>
        </div>
      </Group>
    </Box>
  );
}
