import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { loginUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

export const useAuthRequired = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(loginUrl());
    }
  }, [isAuthenticated]);
};
