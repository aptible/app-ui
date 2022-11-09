import cn from "classnames";

/*
  https://tailwindui.com/components/application-ui/feedback/alerts
*/

type AlertProps = {
  title: string;
  variant?: "default" | "warn" | "danger" | "success";
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const themes = {
  default: { bg: "bg-blue-50", title: "text-blue-800", body: "text-blue-700" },
  success: {
    bg: "bg-green-50",
    title: "text-green-800",
    body: "text-green-700",
  },
  warn: {
    bg: "bg-yellow-50",
    title: "text-yellow-800",
    body: "text-yellow-700",
  },
  danger: { bg: "bg-red-50", title: "text-red-800", body: "text-red-700" },
};

export const Alert = ({ children, icon, variant = "default" }: AlertProps) => {
  return (
    <div className={cn("rounded-md p-4", themes[variant].bg)}>
      <div className="flex">
        <div className="flex-shrink-0">{icon && icon}</div>
        <div className="ml-3">
          <h3 className={cn("text-sm font-medium ", themes[variant].title)}>
            Attention needed
          </h3>
          <div className={cn("mt-2 text-sm", themes[variant].body)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
