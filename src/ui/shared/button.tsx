import cn from "classnames";
import { ButtonHTMLAttributes, FC } from "react";
import { IconPlusCircle } from "./icons";
import { tokens } from "./tokens";

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Shape = "button" | "pill";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  layout?: "block" | "auto";
  variant?: "primary" | "secondary" | "white";
  size?: Size;
  shape?: Shape;
  isLoading?: boolean;
  children: React.ReactNode;
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

export const ButtonCreate = ({
  children,
  className = "",
  onClick = () => {},
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => any;
}) => {
  return (
    <Button variant="primary" className={`${className}`} onClick={onClick}>
      <IconPlusCircle color="black" />
      <span className="pl-2">{children}</span>
    </Button>
  );
};

export const Button: FC<ButtonProps> = ({
  children,
  layout = "auto",
  variant = "white",
  size = "md",
  shape = "button",
  isLoading = false,
  className = "",
  ...props
}) => {
  const classes = cn(
    "flex items-center justify-center",
    buttonLayout[layout],
    tokens.buttons.sizes[size],
    tokens.buttons.styles[variant],
    buttonShapeStyle(size, shape),
  );
  return (
    <button {...props} className={`${classes} ${className}`}>
      {isLoading ? "Loading ..." : children}
    </button>
  );
};
