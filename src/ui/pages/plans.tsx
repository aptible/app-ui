import { HeroBgLayout } from "../layouts";
import { Plans } from "../shared";
import {
  fetchActivePlans,
  fetchPlanById,
  fetchPlans,
  selectFirstActivePlan,
  selectPlanById,
  selectPlansAsList,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";

import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useQuery } from "saga-query/react";

export const PlansPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const plans = useSelector(selectPlansAsList);
  const activePlan = useSelector(selectFirstActivePlan);

  useQuery(fetchPlans());
  useQuery(fetchActivePlans({ organization_id: org.id }));
  useQuery(fetchPlanById({ id: activePlan.planId }));

  const selectedPlan = useSelector((s: AppState) =>
    selectPlanById(s, { id: activePlan?.planId ?? "" }),
  );

  return (
    <HeroBgLayout width={1200}>
      <Plans
        plans={plans}
        activePlan={activePlan}
        selectedPlan={selectedPlan}
      />
    </HeroBgLayout>
  );
};
