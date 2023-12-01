import { createLog } from "@app/debug";
import { useSelector } from "@app/react";
import { db } from "@app/schema";

const log = createLog("modal-portal");

export const ModalPortal = () => {
  const modal = useSelector(db.modal.select);
  const closeModal = () => {};
  log(modal.props, closeModal);

  switch (modal) {
    default:
      return null;
  }
};
