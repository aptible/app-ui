import { Link } from "react-router-dom";
import classNames from "classnames";

export const HelpLink = ({
  children,
  className = "",
  to,
}: {
  children: React.ReactNode;
  to: string;
  className?: string;
}) => {
  return (
    <Link
      to={to}
      className={classNames(
        "text-green-200",
        "no-underline",
        "focus:underline",
        "focus:text-green-100",
        "hover:underline",
        "hover:text-green-100",
        "leading-normal",
        className,
      )}
      style={{ letterSpacing: "0.02em" }}
    >
      {children}
    </Link>
  );
};
