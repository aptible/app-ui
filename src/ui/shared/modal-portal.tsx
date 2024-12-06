import { createLog } from "@app/debug";
import { useSelector } from "@app/react";
import { schema } from "@app/schema";
import { ModalType } from "@app/types";

const log = createLog("modal-portal");

export const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
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
    case ModalType.NONE:
      return null;
    default:
      return null;
  }
};
