import { createReducerMap } from '@app/slice-helpers';
import { ActionWithPayload, AppState, ModalType, ModalState } from '@app/types';
import { createSlice } from '@reduxjs/toolkit';

const MODALS_NAME = 'modal';

const initialState = {
  type: ModalType.NONE,
  props: {} as any,
};

const modals = createSlice({
  name: MODALS_NAME,
  initialState,
  reducers: {
    openModal: (
      _,
      action: ActionWithPayload<Partial<ModalState> & { type: ModalType }>,
    ) => ({
      props: {},
      ...action.payload,
    }),
    closeCurrentModal: () => initialState,
  },
});
export const { openModal, closeCurrentModal } = modals.actions;
export const selectModal = (state: AppState) => state[MODALS_NAME];
export const selectCurrentModal = (state: AppState) => selectModal(state).type;
export const selectModalProps = (state: AppState) => selectModal(state).props;
export const reducers = createReducerMap(modals);
