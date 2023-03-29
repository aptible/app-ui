import { ActionList, ActionListView } from "./action-list-view";
import { tokens } from "./tokens";
import cn from "classnames";
import { PropsWithChildren } from "react";

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose?: () => void;
}>;

export function Modal({ children, isOpen }: ModalProps) {
  const classes = cn(
    "bg-white",
    "align-middle max-w-lg w-full p-0",
    "relative inline-block rounded-lg text-left overflow-hidden shadow-xl transform transition-all",
  );

  if (!isOpen) {
    return null;
  }
  return <div className={classes}>{children}</div>;
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
      className={cn(tokens.type["subdued active link"], "p-0 text-sm")}
      onClick={() => onClose()}
      onKeyDown={() => onClose()}
    >
      Close
    </button>
  ) : null;
  return (
    <div className="m-6 pb-6 mb-0 border-b border-gray-100">
      <div className="flex items-start">
        {title}
        {onClose && closeButton}
      </div>
      {description}
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
