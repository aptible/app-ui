export enum ModalType {
  NONE = "",
  BackupRPNotice = "backup-rp-notice",
}

export interface ModalState {
  type: ModalType;
  props: any;
}
