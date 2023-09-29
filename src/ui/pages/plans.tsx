import {
  fetchActivePlans,
  fetchPlans,
  selectFirstActivePlan,
  selectPlanById,
  selectPlansAsList,
  updateActivePlan,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import { billingMethodUrl, logoutUrl } from "@app/routes";
import { AppState } from "@app/types";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const org = useSelector(selectOrganizationSelected);
  const plans = useSelector(selectPlansAsList);
  const activePlan = useSelector(selectFirstActivePlan);

  const updatePlanLoader = useLoader(updateActivePlan);
  const planLoader = useQuery(fetchPlans());
  const activePlanLoader = useQuery(
    fetchActivePlans({ organization_id: org.id }),
  );

  const selectedPlan = useSelector((s: AppState) =>
    selectPlanById(s, { id: activePlan.planId }),
  );

  useLoaderSuccess(updatePlanLoader, () => {
    navigate(billingMethodUrl());
  });

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
            Your trial has expired, choose a plan to continue or{" "}
            <Link to={logoutUrl()}>Log Out</Link>
          </p>
        </div>
      </div>

      <Group>
        <BannerMessages {...updatePlanLoader} />
        <BannerMessages {...planLoader} />
        <BannerMessages {...activePlanLoader} />
        {activePlan ? (
          <Banner>
            <Link to={billingMethodUrl()} className="flex items-center gap-1">
              Continue to billing{" "}
              <IconArrowRight variant="sm" color="#4361FF" />
            </Link>
          </Banner>
        ) : null}
      </Group>

      <Plans
        plans={plans}
        activePlan={activePlan}
        selectedPlan={selectedPlan}
        onSelectPlan={onSelectPlan}
      />
    </HeroBgLayout>
  );
};
