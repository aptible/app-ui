import { HeroBgLayout } from "../layouts";
import { BannerMessages, Plans, tokens } from "../shared";
import {
  fetchActivePlans,
  fetchPlans,
  selectFirstActivePlan,
  selectPlanById,
  selectPlansAsList,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { logoutUrl } from "@app/routes";

import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

export const PlansPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const plans = useSelector(selectPlansAsList);
  const activePlan = useSelector(selectFirstActivePlan);

  const planLoader = useQuery(fetchPlans());
  const activePlanLoader = useQuery(
    fetchActivePlans({ organization_id: org.id }),
  );

  const selectedPlan = useSelector((s: AppState) =>
    selectPlanById(s, { id: activePlan?.planId ?? "" }),
  );

  return (
    <HeroBgLayout width={1200}>
      <h1 className={`${tokens.type.h1} text-center`}>Choose a Plan</h1>
      <div className="flex text-center items-center justify-center mt-4">
        <div className="max-w-2xl">
          <p>
            Your trial has expired, choose a plan to continue or{" "}
            <Link to={logoutUrl()}>Log Out</Link>
          </p>
        </div>
      </div>
      {planLoader.isError || planLoader.meta?.isWarning ? (
        <BannerMessages {...planLoader} />
      ) : null}
      {activePlanLoader.isError || activePlanLoader.meta?.isWarning ? (
        <BannerMessages {...activePlanLoader} />
      ) : null}
      {planLoader.isSuccess && activePlanLoader.isSuccess ? <Plans
        plans={plans}
        activePlan={activePlan}
        selectedPlan={selectedPlan}
      /> : null}
    </HeroBgLayout>
  );
};
