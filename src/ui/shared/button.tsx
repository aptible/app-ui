import { selectUserHasPerms } from "@app/deploy";
import { selectIsUserAnyOwner } from "@app/roles";
import { capitalize } from "@app/string-utils";
import { AppState, PermissionScope } from "@app/types";
import cn from "classnames";
import { ButtonHTMLAttributes, FC, useState } from "react";
import { useSelector } from "react-redux";
import { Link, LinkProps } from "react-router-dom";
import { Group } from "./group";
import { IconExternalLink } from "./icons";
import { tokens } from "./tokens";
import { Tooltip } from "./tooltip";

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Shape = "button" | "pill";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  layout?: "block" | "auto";
  variant?: "primary" | "secondary" | "white" | "delete" | "success";
  size?: Size;
  shape?: Shape;
  isLoading?: boolean;
  requireConfirm?: boolean;
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
      <span className={children ? "pl-2" : ""}>{children}</span>
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
    "hover:no-underline cursor-pointer",
  );
  return (
    <a {...props} target="_blank" className={`${className} ${classes}`}>
      {isLoading ? "Loading..." : children}
    </a>
  );
};

export const ButtonLinkDocs = ({ href }: { href: string }) => {
  return (
    <ButtonLinkExternal
      href={href}
      className="ml-5 w-fit"
      variant="white"
      size="sm"
    >
      View Docs
      <IconExternalLink variant="sm" className="inline ml-1 h-5 mt-0" />
    </ButtonLinkExternal>
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
    "hover:no-underline cursor-pointer",
  );
  return (
    <Link {...props} className={`${className} ${classes}`}>
      {isLoading ? "Loading..." : children}
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
  requireConfirm = false,
  ...props
}) => {
  const [confirmPrompted, setConfirmPrompted] = useState(false);
  const classes = cn(
    "flex items-center justify-center",
    buttonLayout[layout],
    tokens.buttons.sizes[size],
    tokens.buttons.styles[variant],
    buttonShapeStyle(size, shape),
    { "opacity-50": props.disabled },
  );
  if (confirmPrompted) {
    const cls = cn(
      tokens.buttons.sizes[size],
      tokens.buttons.styles.white,
      buttonShapeStyle(size, shape),
    );
    return (
      <Group variant="horizontal" size="sm">
        <button
          className={cls}
          type="reset"
          onClick={() => setConfirmPrompted(false)}
        >
          Cancel
        </button>
        <button
          {...props}
          onClick={(e) => {
            setConfirmPrompted(false);
            if (props.onClick) {
              props.onClick(e);
            }
          }}
          type={type}
          className={`${className} ${classes}`}
          disabled={isLoading || props.disabled}
        >
          Confirm
        </button>
      </Group>
    );
  }

  if (requireConfirm) {
    props = {
      ...props,
      onClick: () => setConfirmPrompted(true),
    };
  }

  return (
    <button
      {...props}
      type={type}
      className={`${className} ${classes}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? "Loading..." : children}
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

  if (hasPerm) {
    return <Button {...props}>{children}</Button>;
  }

  return (
    <Tooltip
      text={`You do not have "${capitalize(
        scope,
      )}" permissions for this environment (id:${envId})`}
    >
      <Button {...props} disabled>
        {children}
      </Button>
    </Tooltip>
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

export const ButtonOwner = ({ children, ...props }: ButtonProps) => {
  const isUserOwner = useSelector(selectIsUserAnyOwner);

  if (isUserOwner) {
    return <Button {...props}>{children}</Button>;
  }

  return (
    <Tooltip text="You do not have a valid role type (platform_owner, owner) to access this resource">
      <Button {...props} disabled>
        {children}
      </Button>
    </Tooltip>
  );
};

export const ButtonCreate = createButtonPermission("deploy");
export const ButtonDestroy = createButtonPermission("destroy");
export const ButtonOps = createButtonPermission("observability");
export const ButtonSensitive = createButtonPermission("sensitive");
export const ButtonFullVisibility = createButtonPermission("read");
export const ButtonAdmin = createButtonPermission("admin");
