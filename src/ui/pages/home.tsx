import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import { hostingUrl } from "@app/routes";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "starfx/react";

export const HomePage = () => {
  const redirectPath = useSelector(selectRedirectPath) || hostingUrl();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    navigate(redirectPath, { replace: true });
    dispatch(resetRedirectPath());
  }, []);
  return null;
};
