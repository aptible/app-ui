import { fetchBillingDetail, selectHasPaymentMethod } from "@app/billing";
import { plansUrl } from "@app/routes";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useLoader } from "saga-query/react";

export const usePaymentRequired = () => {
  const navigate = useNavigate();
  const loader = useLoader(fetchBillingDetail);
  const hasPaymentMethod = useSelector(selectHasPaymentMethod);

  useEffect(() => {
    if (loader.lastSuccess === 0) return;
    if (loader.isLoading) return;
    if (loader.isError) return;
    if (!hasPaymentMethod) {
      navigate(plansUrl());
    }
  }, [loader.lastSuccess, loader.status, hasPaymentMethod]);
};
