import cn from 'classnames';
import { Fragment, PropsWithChildren } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ActionList, ActionListView } from './action-list-view';
import { tokens } from './tokens';

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  initialFocus?: any;
}>;

export function Modal({
  initialFocus,
  isOpen,
  children,
  onClose,
  closeOnOverlayClick = true,
}: ModalProps) {
  const classes = cn(
    tokens.colors.background,
    'align-middle max-w-lg w-full p-0',
    'relative inline-block rounded-lg text-left overflow-hidden shadow-xl transform transition-all',
  );
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        initialFocus={initialFocus}
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => (onClose && closeOnOverlayClick ? onClose() : null)}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className={classes}>
              <div>{children}</div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

type ModalHeadingProps = {
  title: string;
  description?: string;
  onClose?: () => void;
};
export function ModalHeading({
  title,
  description,
  onClose,
}: ModalHeadingProps) {
  const closeButton = onClose ? (
    <button
      className={cn(tokens.type['subdued active link'], 'p-0 text-sm')}
      onClick={() => onClose()}
    >
      Close
    </button>
  ) : null;
  return (
    <div className="m-6 pb-6 mb-0 border-b border-gray-100">
      <div className="flex items-start">
        <Dialog.Title className={cn('flex-1', tokens.type.h3, 'mb-2')}>
          {title}
        </Dialog.Title>
        {onClose && closeButton}
      </div>
      <Dialog.Description className={cn(tokens.type['small lighter'])}>
        {description}
      </Dialog.Description>
    </div>
  );
}

export function ModalFooter({ actions }: { actions: ActionList }) {
  return (
    <div className="px-6 py-4 bg-gray-50">
      <ActionListView actions={actions} align="left" />
    </div>
  );
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}
