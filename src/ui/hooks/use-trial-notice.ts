import {
  fetchStripeSources,
  fetchTrials,
  selectBillingDetail,
} from "@app/billing";
import { timeBetween } from "@app/date";
import { useCache } from "@app/fx";
import { HalEmbedded } from "@app/types";
import { useSelector } from "react-redux";

interface StripeSourceResponse {
  id: string;
  deactivated_at: string | null;
  description: string;
  stripe_token_id: string;
  stripe_type: string;
  stripe_metadata: Record<string, any> | null;
}

interface TrialResponse {
  id: string;
  range_begin: string;
  range_end: string;
}

const isActive = (trial: TrialResponse) => {
  const now = new Date();
  const rangeBegin = new Date(trial.range_begin);
  const rangeEnd = new Date(trial.range_end);
  return now >= rangeBegin && now <= rangeEnd;
};

export function useTrialNotice() {
  const billingDetail = useSelector(selectBillingDetail);
  const trials = useCache<HalEmbedded<{ trials: TrialResponse[] }>>(
    fetchTrials({ id: billingDetail.id }),
  );
  const stripeSources = useCache<
    HalEmbedded<{ stripe_sources: StripeSourceResponse[] }>
  >(fetchStripeSources({ id: billingDetail.id }));
  const now = new Date().toISOString();

  if (!trials.lastSuccess || !stripeSources.lastSuccess) {
    return { hasTrialNoPayment: false, endDate: now, expiresIn: "" };
  }

  const currentTrial = trials.data?._embedded?.trials.find(isActive);
  const hasSource = stripeSources.data?._embedded.stripe_sources.some(
    (ss) => ss.deactivated_at === null,
  );
  const startDate = currentTrial?.range_begin ? currentTrial.range_begin : now;
  const endDate = currentTrial?.range_end ? currentTrial.range_end : now;

  return {
    hasTrialNoPayment: typeof currentTrial !== "undefined" && !hasSource,
    endDate,
    expiresIn: timeBetween({ startDate, endDate }),
  };
}
