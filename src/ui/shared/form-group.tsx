import classNames from "classnames";
import { LabelHTMLAttributes, PropsWithChildren } from "react";
import { tokens } from "./tokens";

export function Form({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>) {
  return <form className={`flex flex-col gap-4 ${className}`} {...props} />;
}

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label(props: LabelProps) {
  const classes = classNames(tokens.type.h4, "block", props.className);

  /* eslint-disable jsx-a11y/label-has-associated-control */
  return <label {...props} className={classes} />;
}

export interface Feedback {
  variant?: FeedbackVariant;
  children: React.ReactNode;
}

export function FormGroupFeedback({ children, variant = "default" }: Feedback) {
  const classes = classNames("text-sm mt-1", {
    "text-red-400": variant === "danger",
    "text-limegreen": variant === "success",
    "text-orange-400": variant === "warn",
    "text-indigo-400": variant === "info",
    "text-black": variant === "default",
  });
  return <div className={classes}>{children}</div>;
}

export type FeedbackVariant =
  | "warn"
  | "danger"
  | "success"
  | "info"
  | "default";

interface Props extends PropsWithChildren {
  label: string;
  labelProps?: LabelProps;
  htmlFor: string;
  description?: string | JSX.Element;
  feedbackMessage?: string | null;
  feedbackVariant?: FeedbackVariant;
  splitWidthInputs?: boolean;
  className?: string;
}

export function FormGroup({
  feedbackMessage,
  children,
  label,
  labelProps,
  htmlFor,
  description,
  splitWidthInputs,
  feedbackVariant = "default",
  className = "",
}: Props) {
  return (
    <div
      className={`flex gap-1 ${
        splitWidthInputs ? "" : "flex-col"
      } ${className}`}
    >
      <div className={`${splitWidthInputs ? "w-1/2" : ""}`}>
        <Label htmlFor={htmlFor} {...labelProps}>
          {label}
        </Label>
        {description ? (
          <div className="text-black-500 mb-1 mr-2">{description}</div>
        ) : null}
      </div>

      <div
        className={`flex flex-col ${splitWidthInputs ? "w-1/2" : "flex-col"}`}
      >
        {children}
        {feedbackMessage ? (
          <FormGroupFeedback variant={feedbackVariant}>
            {feedbackMessage}
          </FormGroupFeedback>
        ) : null}
      </div>
    </div>
  );
}
