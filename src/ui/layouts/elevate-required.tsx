import { elevateUrl } from "@app/routes";
import { selectIsElevatedTokenValid } from "@app/token";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import { Outlet } from "react-router-dom";

export const ElevateRequired = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const location = useLocation();
  const isElevatedTokenValid = useSelector(selectIsElevatedTokenValid);

  if (!isElevatedTokenValid) {
    return <Navigate to={elevateUrl(location.pathname)} replace />;
  }

  return (
    <div className="w-full h-full">{children ? children : <Outlet />}</div>
  );
};
