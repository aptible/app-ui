import {
  fetchActivePlans,
  fetchPlans,
  selectFirstActivePlan,
  selectPlanByActiveId,
  updateActivePlan,
} from "@app/deploy";
import { useLoader, useQuery } from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import { billingMethodUrl, logoutUrl } from "@app/routes";
import { AppState } from "@app/types";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HeroBgLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Group,
  IconArrowRight,
  Plans,
  tokens,
} from "../shared";

export const PlansPage = () => {
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);

  const activePlanLoader = useQuery(
    fetchActivePlans({ organization_id: org.id }),
  );
  const activePlan = useSelector(selectFirstActivePlan);

  const planLoader = useQuery(fetchPlans());
  const selectedPlan = useSelector((s: AppState) =>
    selectPlanByActiveId(s, { id: activePlan.planId }),
  );
  const updatePlanLoader = useLoader(updateActivePlan);

  const onSelectPlan = ({ planId, name }: { planId: string; name: string }) => {
    dispatch(
      updateActivePlan({
        id: activePlan.id,
        planId,
        name,
      }),
    );
  };

  return (
    <HeroBgLayout width={1200}>
      <h1 className={`${tokens.type.h1} text-center`}>Choose a Plan</h1>

      <div className="flex text-center items-center justify-center my-4">
        <div className="max-w-2xl">
          <p>
            If your trial has expired, choose a plan to continue or{" "}
            <Link to={logoutUrl()}>Log Out</Link>
          </p>
        </div>
      </div>

      <Group>
        <BannerMessages {...updatePlanLoader} />
        <BannerMessages {...planLoader} />
        <BannerMessages {...activePlanLoader} />
        <Banner>
          <Link to={billingMethodUrl()} className="flex items-center gap-1">
            Continue to billing <IconArrowRight variant="sm" color="#4361FF" />
          </Link>
        </Banner>
      </Group>

      <Plans
        activePlan={activePlan}
        selected={selectedPlan.name}
        onSelectPlan={onSelectPlan}
      />
    </HeroBgLayout>
  );
};
