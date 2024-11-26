import { createLog } from "@app/debug";
import { closeModal, readNotice } from "@app/modal";
import { useDispatch, useSelector } from "@app/react";
import { schema } from "@app/schema";
import { ModalType } from "@app/types";
import { Button } from "./button";
import { ExternalLink } from "./external-link";
import { Group } from "./group";
import { Modal, ModalBody, ModalFooter, ModalHeading } from "./modal";

const log = createLog("modal-portal");

const BackupRPNotice = () => {
  const dispatch = useDispatch();
  const gotit = () => {
    dispatch(readNotice(ModalType.BackupRPNotice));
    dispatch(closeModal());
  };

  return (
    <ModalWrapper>
      <Modal isOpen>
        <ModalHeading title="New Default Backup Retention Policy" />
        <ModalBody>
          <Group>
            <p>
              As of <span className="font-bold">07/25/2024</span>, we've changed
              the default backup retention policy for newly created environments
              to:
            </p>
            <ul className="list-disc list-inside">
              <li>30 daily</li>
              <li>12 monthly</li>
              <li>6 yearly</li>
              <li>cross-region copy: disabled</li>
              <li>keep final backup: enabled</li>
            </ul>
            <p>
              For more information,{" "}
              <ExternalLink href="https://www.aptible.com/changelog/new-default-backup-retention-policy">
                read the changelog.
              </ExternalLink>
            </p>
          </Group>
        </ModalBody>
        <ModalFooter
          actions={[
            <Button key="gotit" variant="primary" onClick={gotit}>
              Got it!
            </Button>,
          ]}
        />
      </Modal>
    </ModalWrapper>
  );
};

const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-opacity-50 bg-black z-10">
      <div>{children}</div>
    </div>
  );
};

export const ModalPortal = () => {
  const modal = useSelector(schema.modal.select);
  // const closeModal = () => {};
  log(modal);

  switch (modal.type) {
    case ModalType.BackupRPNotice: {
      return <BackupRPNotice />;
    }
    default:
      return null;
  }
};
