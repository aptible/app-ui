import { useEffect, useMemo, useState, useRef } from 'react';
import { createConsumer, Consumer, Subscription } from '@rails/actioncable';

interface LogMessage {
  verbose: boolean;
  type: 'info' | 'warn';
  message: string;
}

interface ChannelCallbacks {
  received?: (data: any) => void;
  initialized?: () => void;
  connected?: () => void;
  disconnected?: () => void;
  rejected?: () => void;
}

interface ChannelData {
  channel: string;
  [key: string]: any;
}

interface QueueItem {
  action: string;
  payload: any;
}

interface SendOptions {
  action: string;
  payload: any;
  useQueue: boolean;
}

const log = (x: LogMessage): void => {
  if(x.verbose) console[x.type](`useActionCable: ${x.message}`)
}

export function useActionCable(url: string, {verbose = false}: {verbose?: boolean} = {}) {
  const actionCable = useMemo(() => createConsumer(url), [url]);

  useEffect(() => {
    return () => actionCable.disconnect();
  }, []);

  return {
    actionCable
  };
}

export function useChannel(actionCable: Consumer, {verbose = false}: {verbose?: boolean} = {}) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const channelRef = useRef<Subscription | null>(null);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, []);

  const subscribe = (data: ChannelData, callbacks: ChannelCallbacks): void => {
    const channel = actionCable.subscriptions.create(data, {
      received: message => {
        if (callbacks.received) callbacks.received(message);
      },
      initialized: () => {
        setSubscribed(true);
        if (callbacks.initialized) callbacks.initialized();
      },
      connected: () => {
        setConnected(true);
        if (callbacks.connected) callbacks.connected();
      },
      disconnected: () => {
        setConnected(false);
        if (callbacks.disconnected) callbacks.disconnected();
      },
      rejected: () => {
        setConnected(false);
        if (callbacks.rejected) callbacks.rejected();
      }
    });
    channelRef.current = channel;
  };

  const unsubscribe = (): void => {
    setSubscribed(false);

    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };

  useEffect(() => {
    if (subscribed && connected && queue.length > 0) {
      processQueue();
    } else if ((!subscribed || !connected) && queue.length > 0) {
      console.log(`Queue paused. Subscribed: ${subscribed}. Connected: ${connected}. Queue length: ${queue.length}`);
    }
  }, [queue[0], connected, subscribed]);

  const processQueue = (): void => {
    const action = queue[0];

    try {
      perform(action.action, action.payload);
      setQueue(prevState => {
        let q = [...prevState];
        q.shift();
        return q;
      });
    } catch {
      console.log(`Unable to perform action '${action.action}'. It will stay at the front of the queue.`);
    }
  };

  const enqueue = (action: string, payload: any): void => {
    setQueue(prevState => [...prevState, {
      action: action,
      payload: payload
    }]);
  };

  const perform = (action: string, payload: any): void => {
    if (subscribed && !connected) throw new Error('useActionCable: not connected');
    if (!subscribed) throw new Error('useActionCable: not subscribed');
    try {
      channelRef.current?.perform(action, payload);
    } catch {
      throw new Error('useActionCable: Unknown error');
    }
  };

  const send = ({action, payload, useQueue}: SendOptions): void => {
    if (useQueue) {
      enqueue(action, payload);
    } else {
      perform(action, payload);
    }
  };

  return {
    subscribe,
    unsubscribe,
    send
  };
}
