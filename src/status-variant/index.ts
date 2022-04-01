export type StatusVariant =
  | 'warning'
  | 'success'
  | 'error'
  | 'info'
  | 'default';

export const variantToColor = (s: StatusVariant): string => {
  switch (s) {
    case 'warning':
      return 'orange';
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'info':
      return 'blue';
    default:
      return '';
  }
};
