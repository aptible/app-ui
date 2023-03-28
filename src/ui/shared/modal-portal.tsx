import { useDispatch, useSelector } from "react-redux";

import { createLog } from "@app/debug";
import {
  closeCurrentModal,
  selectCurrentModal,
  selectModalProps,
} from "@app/modal";

const log = createLog("modal-portal");

export const ModalPortal = () => {
  const dispatch = useDispatch();
  const modal = useSelector(selectCurrentModal);
  const modalProps = useSelector(selectModalProps);
  const closeModal = () => dispatch(closeCurrentModal());
  log(modalProps, closeModal);

  switch (modal) {
    default:
      return null;
  }
};
