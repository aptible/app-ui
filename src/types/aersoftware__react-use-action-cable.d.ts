declare module '@aersoftware/react-use-action-cable' {
  export interface ActionCable {
    subscribe: (params: any) => void;
    disconnect: () => void;
  }

  export interface Channel {
    subscribe: (params: any, callbacks: any) => void;
    unsubscribe: () => void;
    send: (data: any) => void;
  }

  export function useActionCable(url: string): { actionCable: ActionCable };
  export function useChannel(actionCable: ActionCable): Channel;
}
