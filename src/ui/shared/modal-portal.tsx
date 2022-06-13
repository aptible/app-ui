import { useSelector, useDispatch } from 'react-redux';

import {
  selectCurrentModal,
  selectModalProps,
  closeCurrentModal,
} from '@app/modal';

export const ModalPortal = () => {
  const dispatch = useDispatch();
  const modal = useSelector(selectCurrentModal);
  const modalProps = useSelector(selectModalProps);
  const closeModal = () => dispatch(closeCurrentModal());
  console.log(modalProps, closeModal);

  switch (modal) {
    default:
      return null;
  }
};
