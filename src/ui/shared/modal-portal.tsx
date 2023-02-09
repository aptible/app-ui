import { useSelector, useDispatch } from "react-redux";

import { createLog } from "@app/debug";
import {
  selectCurrentModal,
  selectModalProps,
  closeCurrentModal,
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
