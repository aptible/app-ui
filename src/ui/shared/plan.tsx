import { capitalize } from "@app/string-utils";
import { DeployActivePlan, DeployPlan, PlanName } from "@app/types";
import { Button, ButtonLinkExternal } from "./button";
import { IconCheckCircle } from "./icons";
import { tokens } from "./tokens";

const descriptionTextForPlan = (planName: PlanName): string =>
  ({
    starter: "Deploy your first few resources",
    growth: "Begin the search for product-market fit",
    scale: "Scale your product and business",
    enterprise: "Meet the highest requirements for security and reliability",
  })[planName];

const Section = ({
  children,
  title = "",
}: { children: React.ReactNode; title?: string }) => {
  return (
    <div className="flex justify-between">
      <div className="w-1/3">{title}</div>
      {children}
    </div>
  );
};

const SectionItem = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => {
  return <div className={`text-center w-1/3 ${className}`}>{children}</div>;
};

const PlanButton = ({
  available,
  contactUs,
  onClick,
  selected,
}: {
  available: boolean;
  contactUs: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
}) => {
  return (
    <div className="flex justify-between mb-2">
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
}) => {
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
}) => {
  if (plan.name === "starter") {
    return (
      <>
        <PlanCostBlock plan={plan} precedingPlan={precedingPlan} />

        <Section>
          <SectionItem className="font-semibold">Includes</SectionItem>
          <SectionItem className="font-semibold">Available</SectionItem>
        </Section>

        <Section title="Compute">
          <SectionItem>-</SectionItem>
          <SectionItem>3 GB</SectionItem>
        </Section>

        <Section title="DB Storage">
          <SectionItem>-</SectionItem>
          <SectionItem>20 GB</SectionItem>
        </Section>

        <Section title="Endpoints">
          <SectionItem>-</SectionItem>
          <SectionItem>1</SectionItem>
        </Section>

        <ul>
          <IconLi>
            Deploy on Shared Stacks (Networking and Compute shared with other
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

        <Section>
          <SectionItem className="font-semibold">Includes</SectionItem>
          <SectionItem className="font-semibold">Available</SectionItem>
        </Section>

        <Section title="Compute">
          <SectionItem>3 GB</SectionItem>
          <SectionItem>11 GB</SectionItem>
        </Section>

        <Section title="DB Storage">
          <SectionItem>10 GB</SectionItem>
          <SectionItem>60 GB</SectionItem>
        </Section>

        <Section title="Endpoints">
          <SectionItem>1</SectionItem>
          <SectionItem>3</SectionItem>
        </Section>

        <ul>
          <IconLi>15% discount on included resources</IconLi>
          <IconLi>
            Up to 2 concurrent SSH Sessions for temporary container access
          </IconLi>
          <IconLi>Deploy in 1 region (of your choice)</IconLi>
          <IconLi>Support: Choose from Standard or Premium</IconLi>
          <IconLi>Dedicated Stacks (Isolated Tenancy) Available</IconLi>
          <IconLi>Available HIPAA BAA</IconLi>
        </ul>
      </>
    );
  } else if (plan.name === "scale") {
    return (
      <>
        <PlanCostBlock plan={plan} precedingPlan={precedingPlan} />

        <Section>
          <SectionItem className="font-semibold">Includes</SectionItem>
          <SectionItem className="font-semibold">Available</SectionItem>
        </Section>

        <Section title="Compute">
          <SectionItem>10 GB</SectionItem>
          <SectionItem>40 GB</SectionItem>
        </Section>

        <Section title="DB Storage">
          <SectionItem>100 GB</SectionItem>
          <SectionItem>200 GB</SectionItem>
        </Section>

        <Section title="Endpoints">
          <SectionItem>4</SectionItem>
          <SectionItem>20</SectionItem>
        </Section>

        <ul>
          <IconLi>20% discount on included resources</IconLi>
          <IconLi>
            Up to 3 concurrent SSH Sessions for temporary container access
          </IconLi>
          <IconLi>Support: Choose from Standard or Premium</IconLi>
          <IconLi>Dedicated Stacks (Isolated Tenancy) Available</IconLi>
          <IconLi>Available HIPAA BAA</IconLi>
        </ul>
      </>
    );
  } else {
    return (
      <>
        <PlanCostBlock plan={plan} precedingPlan={precedingPlan} />

        <Section>
          <SectionItem className="font-semibold">Includes</SectionItem>
          <SectionItem className="font-semibold">Available</SectionItem>
        </Section>

        <Section title="Compute">
          <SectionItem>Custom</SectionItem>
          <SectionItem>Unlimited</SectionItem>
        </Section>

        <Section title="DB Storage">
          <SectionItem>Custom</SectionItem>
          <SectionItem>Unlimited</SectionItem>
        </Section>

        <Section title="Endpoints">
          <SectionItem>Custom</SectionItem>
          <SectionItem>Unlimited</SectionItem>
        </Section>

        <ul>
          <IconLi>
            No limits on available Compute, Database Storage, or Endpoints
          </IconLi>
          <IconLi>Deploy in 15+ Regions</IconLi>
          <IconLi>99.95% Uptime SLA</IconLi>
          <IconLi>
            Advanced Networking Features such as IPsec VPNs and VPC Peering
          </IconLi>
          <IconLi>
            Available HITRUST Inheritance and Security & Compliance Dashboard
          </IconLi>
          <IconLi>
            Support: Choose from Standard, Premium, Enterprise (24/7 Support)
          </IconLi>
          <IconLi>
            Custom pricing and payment options with annual commitments and
            payments
          </IconLi>
        </ul>
      </>
    );
  }
};

const PlanCard = ({
  plan,
  available,
  selected,
  precedingPlan,
  onSelectPlan,
}: {
  plan: DeployPlan;
  available: boolean;
  selected: boolean;
  precedingPlan?: DeployPlan;
  onSelectPlan: () => void;
}) => {
  const borderColor = selected ? "border-orange-200" : "border-black-100";
  const bottomSectionBgColor = selected
    ? "bg-orange-100 border-orange-200"
    : "bg-gray-100 border-gray-200";

  // on responsive stack em (4/2/1 if possible or just stack)
  // hover color change only on button
  // active is colorized
  // don't forget helper text on growth/scale/enterprise only (not on starter)
  return (
    <div
      className={`w-full rounded-lg overflow-hidden bg-white pt-8 px-0 mx-0 border ${borderColor} relative mt-4`}
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
            onClick={onSelectPlan}
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
  onSelectPlan,
}: {
  plans: DeployPlan[];
  activePlan: DeployActivePlan;
  selectedPlan: DeployPlan;
  onSelectPlan: (p: { planId: string; name: string }) => void;
}) => {
  if (activePlan.id === "") {
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
    <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 lg:mx-0 mx-10 mt-4">
      {plans.map((plan, idx) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          available={activePlan.availablePlans.includes(plan.name)}
          precedingPlan={idx > 0 ? plans[idx - 1] : undefined}
          selected={plan.name === selectedPlan.name}
          onSelectPlan={() =>
            onSelectPlan({ planId: plan.id, name: plan.name })
          }
        />
      ))}
    </div>
  );
};
