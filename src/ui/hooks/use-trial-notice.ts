import {
  type TrialResponse,
  fetchStripeSources,
  fetchTrials,
  selectBillingDetail,
} from "@app/billing";
import { timeBetween } from "@app/date";
import { useCache, useSelector } from "@app/react";

const isActive = (trial: TrialResponse) => {
  const now = new Date();
  const rangeBegin = new Date(trial.range_begin);
  const rangeEnd = new Date(trial.range_end);
  return now >= rangeBegin && now <= rangeEnd;
};

export function useTrialNotice() {
  const billingDetail = useSelector(selectBillingDetail);
  const trials = useCache(fetchTrials({ id: billingDetail.id }));
  const stripeSources = useCache(fetchStripeSources({ id: billingDetail.id }));
  const now = new Date().toISOString();

  if (!trials.lastSuccess || !stripeSources.lastSuccess) {
    return { hasTrialNoPayment: false, endDate: now, expiresIn: "" };
  }

  const currentTrial = trials.data?._embedded?.trials.find(isActive);
  const sources = stripeSources.data?._embedded?.stripe_sources || [];
  const hasSource = sources.some((ss) => ss.deactivated_at === null);
  const startDate = currentTrial?.range_begin ? currentTrial.range_begin : now;
  const endDate = currentTrial?.range_end ? currentTrial.range_end : now;

  return {
    hasTrialNoPayment: typeof currentTrial !== "undefined" && !hasSource,
    endDate,
    expiresIn: timeBetween({ startDate, endDate }),
  };
}
