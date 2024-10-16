import { selectPlansForView, updateActivePlan } from "@app/deploy";
import { useLoader, useSelector } from "@app/react";
import { capitalize } from "@app/string-utils";
import type { DeployActivePlan, DeployPlan, PlanName } from "@app/types";
import { Button, ButtonLinkExternal } from "./button";
import { IconCheckCircle } from "./icons";
import { tokens } from "./tokens";

const descriptionTextForPlan = (planName: PlanName): string =>
  ({
    none: "",
    // Legacy
    starter: "Get started in a limited trial environment",
    growth: "Gain user traction and deliver more functionality",
    scale: "Run mission-critical apps at scale without worry",

    // Current
    development: "Develop your prototype with a seamless path to production",
    production:
      "Go to production in your own private network with everything you need to meet compliance requirements",
    enterprise:
      "Leverage Aptible at scale with enterprise features and support for additional compliance frameworks",
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
  const loader = useLoader(updateActivePlan);
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
    <Button className="w-full" onClick={onClick} isLoading={loader.isLoading}>
      Select Plan
    </Button>
  );
};

const PlanCostBlock = ({
  price,
}: {
  price: string;
}) => {
  return (
    <div className="flex justify-between mb-2">
      <div>
        <p>Starts at</p>
        <h3 className={tokens.type.h4}>{price}</h3>
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
}: {
  plan: DeployPlan;
}) => {
  if (plan.name === "starter") {
    return (
      <>
        <PlanCostBlock price="$0/month" />

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
  }

  if (plan.name === "growth") {
    return (
      <>
        <PlanCostBlock price="$185/month" />

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
  }

  if (plan.name === "scale") {
    return (
      <>
        <PlanCostBlock price="$599/month" />

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
          <IconLi>Dedicated Stacks (Isolated Tenancy) available</IconLi>
          <IconLi>Available HIPAA BAA</IconLi>
        </ul>
      </>
    );
  }

  if (plan.name === "development") {
    return (
      <>
        <PlanCostBlock price="$0/month" />

        <ul>
          <IconLi>
            No limits on available Compute, Database Storage, or Endpoints
          </IconLi>
          <IconLi>Standard Support</IconLi>
        </ul>
      </>
    );
  }

  if (plan.name === "production") {
    return (
      <>
        <PlanCostBlock price="$499/month" />

        <ul>
          <IconLi>Deploy in 15+ regions</IconLi>
          <IconLi>Custom Domains for Apps</IconLi>
          <IconLi>Dedicated Stacks (isolated tenancy) available</IconLi>
          <IconLi>Available HIPAA BAA</IconLi>
          <IconLi>Support: Choose from Standard or Premium</IconLi>
        </ul>
      </>
    );
  }

  return (
    <>
      <PlanCostBlock price="Custom Pricing" />

      <ul>
        <IconLi>99.95% Uptime SLA</IconLi>
        <IconLi>Advanced networking features like IPsec VPNs</IconLi>
        <IconLi>Option to self-host in your AWS</IconLi>
        <IconLi>
          Available HITRUST inheritance and security & compliance consulting
        </IconLi>
        <IconLi>
          Support: Choose from Standard, Premium, Enterprise (24/7 response)
        </IconLi>
        <IconLi>
          Custom pricing and payment options with annual commitments and
          payments
        </IconLi>
      </ul>
    </>
  );
};

const PlanCard = ({
  plan,
  available,
  selected,
  onSelectPlan,
}: {
  plan: DeployPlan;
  available: boolean;
  selected: boolean;
  onSelectPlan: () => void;
}) => {
  const borderColor = selected ? "border-orange-200" : "border-black-100";
  const fontColor = selected ? "text-orange-400" : "text-black";
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
      <div className="mb-8 mx-auto" style={{ height: 135, minWidth: 225 }}>
        <div style={{ height: 95 }}>
          <h2 className={`text-center ${tokens.type.h2} ${fontColor}`}>
            {capitalize(plan.name)}
          </h2>
          <p
            className={
              "text-center mt-4 text-sm mx-auto max-w-full md:max-w-[30ch]"
            }
          >
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
        <BulletListForPlan plan={plan} />
      </div>
    </div>
  );
};

export const Plans = ({
  activePlan,
  selected,
  onSelectPlan,
  paymentRequired,
}: {
  activePlan: DeployActivePlan;
  selected: string;
  onSelectPlan: (p: { planId: string; name: string }) => void;
  paymentRequired: boolean;
}) => {
  const plans = useSelector(selectPlansForView);
  const publishedPlans = [
    plans.development,
    plans.production,
    plans.enterprise,
  ];

  // Only show other plans (starter, growth, scale) if they are selected
  let plansToShow: DeployPlan[] = publishedPlans;
  if (selected === "starter") {
    plansToShow = [plans.starter].concat(publishedPlans);
  } else if (selected === "growth") {
    plansToShow = [plans.growth].concat(publishedPlans);
  } else if (selected === "scale") {
    plansToShow = [plans.scale].concat(publishedPlans);
  }

  // Show 3 column layout if only 3 plans to show, otherwise 4 (when there should be 4 to show)
  let col = "lg:grid-cols-3";
  if (plansToShow.length > 3) {
    col = "lg:grid-cols-4";
  }

  return (
    <div
      className={`grid ${col} md:grid-cols-2 grid-cols-1 gap-4 lg:mx-0 mx-10`}
    >
      {plansToShow.map((plan) => (
        <PlanCard
          key={plan.name}
          plan={plan}
          available={
            !paymentRequired && activePlan.availablePlans.includes(plan.name)
          }
          selected={plan.name === selected}
          onSelectPlan={() =>
            onSelectPlan({ planId: plan.id, name: plan.name })
          }
        />
      ))}
    </div>
  );
};
