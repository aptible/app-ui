import { HeroBgLayout } from "../layouts";
import { Loading, Plans } from "../shared";
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
import { useLoader, useQuery } from "saga-query/react";

export const PlansPage = () => {
  const activePlanLoader = useLoader(fetchPlans);

  const org = useSelector(selectOrganizationSelected);
  const plans = useSelector(selectPlansAsList);
  const activePlan = useSelector(selectFirstActivePlan);

  useQuery(fetchPlans());
  useQuery(fetchActivePlans({ organization_id: org.id }));
  useQuery(fetchPlanById({ id: activePlan.planId }));
  const planLoader = useLoader(fetchActivePlans);
  const specificPlanLoader = useLoader(fetchPlanById);
  const selectedPlan = useSelector((s: AppState) =>
    selectPlanById(s, { id: activePlan?.planId ?? "" }),
  );

  if (
    planLoader.isLoading ||
    activePlanLoader.isLoading ||
    specificPlanLoader.isLoading
  ) {
    return (
      <div className="mt-4">
        <Loading text="Loading ..." />
      </div>
    );
  }

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
