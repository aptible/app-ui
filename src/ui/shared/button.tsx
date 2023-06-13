import { tokens } from "./tokens";
import { selectUserHasPerms } from "@app/deploy";
import { AppState, PermissionScope } from "@app/types";
import cn from "classnames";
import { ButtonHTMLAttributes, FC } from "react";
import { useSelector } from "react-redux";
import { Link, LinkProps } from "react-router-dom";

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Shape = "button" | "pill";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  layout?: "block" | "auto";
  variant?: "primary" | "secondary" | "white" | "delete" | "success";
  size?: Size;
  shape?: Shape;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const buttonLayout = {
  block: "justify-center w-full",
  auto: "",
};

export const buttonShapeStyle = (size: Size, shape: Shape): string => {
  switch (shape) {
    case "pill":
      return "rounded-full";
    case "button":
      return size === "xs" ? "rounded" : "rounded-md";
  }
};

export const ButtonIcon = ({
  children,
  icon,
  ...props
}: ButtonProps & { icon: JSX.Element }) => {
  return (
    <Button {...props}>
      {icon}
      <span className="pl-2">{children}</span>
    </Button>
  );
};

export const ButtonLinkExternal = ({
  children,
  layout = "auto",
  variant = "primary",
  size = "md",
  shape = "button",
  isLoading = false,
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & ButtonProps) => {
  const classes = cn(
    "flex items-center justify-center",
    buttonLayout[layout],
    tokens.buttons.sizes[size],
    tokens.buttons.styles[variant],
    buttonShapeStyle(size, shape),
  );
  return (
    <a {...props} className={`${className} ${classes}`}>
      {isLoading ? "Loading ..." : children}
    </a>
  );
};

export const ButtonLink = ({
  children,
  layout = "auto",
  variant = "primary",
  size = "md",
  shape = "button",
  isLoading = false,
  className = "",
  ...props
}: LinkProps & ButtonProps) => {
  const classes = cn(
    "flex items-center justify-center",
    buttonLayout[layout],
    tokens.buttons.sizes[size],
    tokens.buttons.styles[variant],
    buttonShapeStyle(size, shape),
  );
  return (
    <Link {...props} className={`${className} ${classes}`}>
      {isLoading ? "Loading ..." : children}
    </Link>
  );
};

export const Button: FC<ButtonProps> = ({
  children,
  layout = "auto",
  variant = "primary",
  size = "md",
  shape = "button",
  isLoading = false,
  type = "button",
  className = "",
  ...props
}) => {
  const classes = cn(
    "flex items-center justify-center",
    buttonLayout[layout],
    tokens.buttons.sizes[size],
    tokens.buttons.styles[variant],
    buttonShapeStyle(size, shape),
    { "opacity-50": props.disabled },
  );
  return (
    <button
      {...props}
      type={type}
      className={`${className} ${classes}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? "Loading ..." : children}
    </button>
  );
};

const ButtonPermission = ({
  scope,
  envId,
  children,
  ...props
}: { scope: PermissionScope; envId: string } & ButtonProps) => {
  const hasPerm = useSelector((s: AppState) =>
    selectUserHasPerms(s, { scope, envId }),
  );

  let disabled = props.disabled;
  if (!hasPerm) {
    disabled = true;
  }

  return (
    <Button {...props} disabled={disabled}>
      {children}
    </Button>
  );
};

const createButtonPermission = (
  scope: PermissionScope,
  creatorProps: ButtonProps = {},
) => {
  return ({ envId, children, ...props }: { envId: string } & ButtonProps) => {
    return (
      <ButtonPermission
        scope={scope}
        envId={envId}
        {...creatorProps}
        {...props}
      >
        {children}
      </ButtonPermission>
    );
  };
};

export const ButtonCreate = createButtonPermission("deploy");
export const ButtonDestroy = createButtonPermission("destroy");
