import { PropsWithChildren, LabelHTMLAttributes } from "react";
import { tokens } from "./tokens";
import classNames from "classnames";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label(props: LabelProps) {
  const classes = classNames(
    tokens.type["small semibold darker"],
    "block",
    props.className,
  );

  /* eslint-disable jsx-a11y/label-has-associated-control */
  return <label {...props} className={classes} />;
}

export type Feedback = {
  message: string;
  variant: Variant;
};

export function FormGroupFeedback({ message, variant }: Feedback) {
  const classes = classNames("text-sm mt-1", {
    [tokens.type["danger semibold"]]: variant === "danger",
    [tokens.type["success semibold"]]: variant === "success",
    [tokens.type["warn semibold"]]: variant === "warn",
    [tokens.type["info semibold"]]: variant === "info",
  });
  return <div className={classes}>{message}</div>;
}

type Variant = "warn" | "danger" | "success" | "info";

type Props = PropsWithChildren<{
  label: string;
  htmlFor: string;
  description?: string;
  feedbackMessage?: string | null;
  feedbackVariant?: Variant;
}>;

export function FormGroups({ children }: PropsWithChildren<any>) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function FormGroup({
  feedbackVariant = "info",
  feedbackMessage,
  children,
  label,
  htmlFor,
  description,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label htmlFor={htmlFor}>{label}</Label>

        {description && (
          <p className={classNames(tokens.type["small lighter"])}>
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {children}
        {feedbackMessage && (
          <FormGroupFeedback
            message={feedbackMessage}
            variant={feedbackVariant}
          />
        )}
      </div>
    </div>
  );
}
