import {
  ServiceSizingPolicyResponse,
  defaultServiceSizingPolicyResponse,
  fetchServiceSizingPoliciesByServiceId,
} from "@app/deploy";
import { HalEmbedded } from "@app/types";
import { useMemo } from "react";
import { useCache } from "starfx/react";

export function useServiceSizingPolicy(service_id: string) {
  const policy = useCache<
    HalEmbedded<{
      service_sizing_policies: ServiceSizingPolicyResponse[];
    }>
  >(fetchServiceSizingPoliciesByServiceId({ service_id }));

  const policies = policy.data?._embedded?.service_sizing_policies || [];
  const existingPolicy = useMemo(() => {
    let policy;
    if (policies[0] === undefined) {
      policy = { service_id };
    } else {
      policy = policies[0];
      policy.service_id = service_id;
    }
    return defaultServiceSizingPolicyResponse(policy);
  }, [policies.length, policies[0]?.id, policies[0]?.service_id]);

  return { policy, existingPolicy };
}
