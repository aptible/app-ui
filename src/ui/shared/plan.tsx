import { Button, ButtonLinkExternal } from "./button";
import { IconCheckCircle } from "./icons";
import { tokens } from "./tokens";
import { updateAndRefreshActivePlans } from "@app/deploy";
import { capitalize } from "@app/string-utils";
import { DeployActivePlan, DeployPlan, PlanName } from "@app/types";
import { ReactElement, SyntheticEvent } from "react";
import { useDispatch } from "react-redux";

const descriptionTextForPlan = (planName: PlanName): string =>
  ({
    starter: "Begin the search for product-market fit",
    growth: "Start growing your user base",
    scale: "Scale your product and business",
    enterprise: "Meet the highest requirements for security and reliability",
  })[planName];

const discountForPlan = (planName: PlanName): string =>
  ({
    starter: "",
    growth: "15% Off included resources",
    scale: "20% Off included resources",
    enterprise: "",
  })[planName];

const PlanButton = ({
  available,
  contactUs,
  onClick,
  selected,
}: {
  available: boolean;
  contactUs: boolean;
  onClick: (e: SyntheticEvent) => void;
  selected: boolean;
}) => {
  if (contactUs) {
    return (
      <ButtonLinkExternal href="https://aptible.com/contact" className="w-full">
        Contact Us
      </ButtonLinkExternal>
    );
  }

  if (selected) {
    return (
      <h3 className="text-center my-4 w-full text-md font-semibold text-orange-300 uppercase">
        Current Plan
      </h3>
    );
  }

  if (!available) {
    return (
      <h3 className="text-center my-4 w-full text-md font-normal text-gray-400">
        Unavailable
      </h3>
    );
  }

  return (
    <Button className="w-full" onClick={onClick}>
      Select Plan
    </Button>
  );
};

const PlanCostBlock = ({
  plan,
  precedingPlan,
}: {
  plan: DeployPlan;
  precedingPlan?: DeployPlan;
}): ReactElement => {
  return (
    <div className="flex justify-between mb-4">
      <div>
        <p>Starts at</p>
        <h3 className={tokens.type.h4}>
          ${(precedingPlan?.costCents || 0) / 100}
        </h3>
      </div>
      <div>
        <p>Approx. Max Invoice</p>
        <h3 className={tokens.type.h4}>${(plan?.costCents || 0) / 100}</h3>
      </div>
    </div>
  );
};

const IconLi = ({
  children,
}: {
  children?: React.ReactNode;
}): ReactElement => {
  return (
    <li>
      <div className="flex my-1 pt-2">
        <div>
          <IconCheckCircle color={"green"} className="mr-1 pt-1" />
        </div>
        <div className="pt-1">{children}</div>
      </div>
    </li>
  );
};

const BulletListForPlan = ({
  plan,
  precedingPlan,
}: {
  plan: DeployPlan;
  precedingPlan?: DeployPlan;
}): ReactElement => {
  if (plan.name === "starter") {
    return (
      <>
        <PlanCostBlock plan={plan} precedingPlan={precedingPlan} />
        <ul>
          <IconLi>
            Up to {plan.containerMemoryLimit / 1024}GB RAM for Compute (App &
            Database Containers)
          </IconLi>
          <IconLi>Up to {plan.diskLimit}GB Database Storage</IconLi>
          <IconLi>Up to {plan.vhostLimit} Endpoint (Load Balancer)</IconLi>
          <IconLi>
            Deploy on Shared stacks (Networking and Compute shared with other
            Aptible customers)
          </IconLi>
          <IconLi>Deploy in US East (N. Virginia)</IconLi>
        </ul>
      </>
    );
  } else if (plan.name === "growth") {
    return (
      <>
        <PlanCostBlock plan={plan} precedingPlan={precedingPlan} />
        <p className="font-semibold text-sm">Everything in Starter, plus:</p>
        <ul>
          <IconLi>{discountForPlan(plan.name)}</IconLi>
          <IconLi>
            Up to {plan.containerMemoryLimit / 1024}GB RAM for Compute (App &
            Database Containers), {plan.includedContainerMb / 1024}GB included
          </IconLi>
          <IconLi>
            Up to {plan.diskLimit}GB Database Storage, {plan.includedDiskGb}GB
            included
          </IconLi>
          <IconLi>
            Up to {plan.vhostLimit} Endpoints (Load Balancers),{" "}
            {plan.includedVhosts} included
          </IconLi>
          <IconLi>
            Up to {plan.ephemeralSessionLimit} concurrent SSH Sessions for
            temporary container access
          </IconLi>
          <IconLi>3 business hour support response times available</IconLi>
        </ul>
      </>
    );
  } else if (plan.name === "scale") {
    return (
      <>
        <PlanCostBlock plan={plan} precedingPlan={precedingPlan} />
        <p className="font-semibold text-sm">Everything in Growth, plus:</p>
        <ul>
          <IconLi>{discountForPlan(plan.name)}</IconLi>
          <IconLi>
            Up to {plan.containerMemoryLimit / 1024}GB RAM for Compute (App &
            Database Containers), {plan.includedContainerMb / 1024}GB included
          </IconLi>
          <IconLi>
            Up to {plan.diskLimit}GB Database Storage, {plan.includedDiskGb}GB
            included
          </IconLi>
          <IconLi>
            Up to {plan.vhostLimit} Endpoints (Load Balancers),{" "}
            {plan.includedVhosts} included
          </IconLi>
          <IconLi>
            Up to {plan.ephemeralSessionLimit} concurrent SSH Sessions for
            temporary container access
          </IconLi>
          <IconLi>Dedicated Stacks (Isolated Tenancy) Available</IconLi>
          <IconLi>Available HIPAA BAA</IconLi>
        </ul>
      </>
    );
  } else {
    return (
      <ul>
        <IconLi>Deploy in 15+ Regions</IconLi>
        <IconLi>99.95% Up-time SLA</IconLi>
        <IconLi>
          Advanced Networking Features such as IPsec VPNs and VPC Peering
        </IconLi>
        <IconLi>HITRUST Inheritance and Security & Compliance Dashboard</IconLi>
        <IconLi>24/7 Support Response Times Available</IconLi>
        <IconLi>
          Custom pricing and payment options with annual commitments and
          payments
        </IconLi>
      </ul>
    );
  }
};

const PlanCard = ({
  activePlan,
  plan,
  available,
  selected,
  precedingPlan,
}: {
  activePlan: DeployActivePlan;
  plan: DeployPlan;
  available: boolean;
  selected: boolean;
  precedingPlan?: DeployPlan;
}): ReactElement => {
  const dispatch = useDispatch();

  const borderColor = selected ? "border-orange-200" : "border-black-100";
  const bottomSectionBgColor = selected
    ? "bg-orange-100 border-orange-200"
    : "bg-gray-100 border-gray-200";

  const handlePlanChange = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(
      updateAndRefreshActivePlans({
        id: activePlan.id,
        planId: plan.id,
        name: plan.name,
      }),
    );
  };

  // on responsive stack em (4/2/1 if possible or just stack)
  // hover color change only on button
  // active is colorized
  // don't forget helper text on growth/scale/enterprise only (not on starter)
  return (
    <div
      className={`w-full rounded overflow-hidden bg-white pt-14 px-0 mx-0 border ${borderColor} rounded relative sm:mt-4`}
    >
      <div className="mb-8 mx-4" style={{ height: 135, minWidth: 225 }}>
        <div style={{ height: 95 }}>
          <h2 className={`text-center ${tokens.type.h2}`}>
            {capitalize(plan.name)}
          </h2>
          <p className={"text-center mt-4 text-sm"}>
            {descriptionTextForPlan(plan.name)}
          </p>
        </div>
        <div className="mx-4 my-4">
          <PlanButton
            available={available}
            contactUs={plan.name === "enterprise"}
            selected={selected}
            onClick={handlePlanChange}
          />
        </div>
      </div>
      <div
        className={`px-4 h-full pt-4 pb-14 border-t ${bottomSectionBgColor} text-sm`}
      >
        <BulletListForPlan plan={plan} precedingPlan={precedingPlan} />
      </div>
    </div>
  );
};

export const Plans = ({
  plans,
  activePlan,
  selectedPlan,
}: {
  plans: DeployPlan[];
  activePlan?: DeployActivePlan;
  selectedPlan: DeployPlan;
}) => {
  if (!activePlan) {
    return <div className="mt-4">No active plan found to proceed.</div>;
  }

  if (plans.length === 0) {
    return (
      <div className="mt-4">
        Unable to load plan data to allow for selection.
      </div>
    );
  }

  // plans are ordered by cost, and enterprise is always last
  const enterprisePlan = plans.find((plan) => plan.name === "enterprise");
  const orderedPlans = plans
    .sort((a, b) => a.costCents - b.costCents)
    .filter((plan) => plan.name !== "enterprise");
  if (enterprisePlan) {
    orderedPlans.push(enterprisePlan);
  }

  return (
    <div className="md:flex md:flex-row md:justify-between gap-4 mt-4">
      {plans.map((plan, idx) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          activePlan={activePlan}
          available={activePlan.availablePlans.includes(plan.name)}
          precedingPlan={idx > 0 ? plans[idx - 1] : undefined}
          selected={plan.name === selectedPlan.name}
        />
      ))}
    </div>
  );
};
