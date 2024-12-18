import { selectHasPaymentMethod } from "@app/billing";
import {
  fetchActivePlans,
  fetchPlans,
  selectFirstActivePlan,
  selectPlanByActiveId,
  selectStacksByOrgAsList,
  updateActivePlan,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import { billingMethodUrl, logoutUrl } from "@app/routes";
import { Link } from "react-router-dom";
import { useTrialNotice } from "../hooks/use-trial-notice";
import { HeroBgLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Group,
  OrgPicker,
  Plans,
  tokens,
} from "../shared";

export const PlansPage = () => {
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);

  const activePlanLoader = useQuery(fetchActivePlans({ orgId: org.id }));
  const activePlan = useSelector(selectFirstActivePlan);

  const planLoader = useQuery(fetchPlans());
  const selectedPlan = useSelector((s) =>
    selectPlanByActiveId(s, { id: activePlan.planId }),
  );
  const updatePlanLoader = useLoader(updateActivePlan);
  const { hasTrialNoPayment } = useTrialNotice();
  const hasPaymentMethod = useSelector(selectHasPaymentMethod);
  const paymentRequired = hasTrialNoPayment || !hasPaymentMethod;

  const stacks = useSelector(selectStacksByOrgAsList);
  console.log(stacks);
  const hasDedicatedStack = stacks.filter((s) => s.organizationId).length > 0;
  const legacy = hasDedicatedStack && !activePlan.planId;
  console.log(legacy);

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
      <Group>
        <h1 className={`${tokens.type.h1} text-center`}>Choose a Plan</h1>

        <Group className="items-center">
          <div className="max-w-2xl">
            <p>
              If your trial has expired, choose a plan to continue or{" "}
              <Link to={logoutUrl()}>Log Out</Link>
            </p>
          </div>
          <div className="min-w-[260px]">
            <OrgPicker />
          </div>
        </Group>

        <Group>
          <BannerMessages {...updatePlanLoader} />
          <BannerMessages {...planLoader} />
          <BannerMessages {...activePlanLoader} />
          {paymentRequired ? (
            <Banner>
              You must <Link to={billingMethodUrl()}>add a payment method</Link>{" "}
              before changing your plan.
            </Banner>
          ) : null}
          {legacy ? (
            <Banner>
              You are currently on a legacy plan and unable to migrate
              automatically, please{" "}
              <Link to="https://aptible.com/contact">contact us</Link> if you
              wish to change your plan.
            </Banner>
          ) : null}
        </Group>

        {legacy ? null : (
          <Plans
            activePlan={activePlan}
            selected={selectedPlan.name}
            onSelectPlan={onSelectPlan}
            paymentRequired={paymentRequired}
          />
        )}
      </Group>
    </HeroBgLayout>
  );
};
