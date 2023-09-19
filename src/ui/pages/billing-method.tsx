import { getStripe } from "@app/billing";
import {
  fetchActivePlans,
  selectFirstActivePlan,
  selectPlanById,
} from "@app/deploy";
import { selectEnv } from "@app/env";
import { selectOrganizationSelected } from "@app/organizations";
import { logoutUrl, plansUrl } from "@app/routes";
import { AppState } from "@app/types";
import { CardElement, Elements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";
import { HeroBgView } from "../layouts";
import {
  AptibleLogo,
  Banner,
  Button,
  CreateProjectFooter,
  Group,
  IconArrowRight,
} from "../shared";

const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  const env = useSelector(selectEnv);
  return (
    <Elements stripe={getStripe(env.stripePublishableKey)}>{children}</Elements>
  );
};

export const BillingMethodPage = () => {
  const org = useSelector(selectOrganizationSelected);
  useQuery(fetchActivePlans({ organization_id: org.id }));
  const activePlan = useSelector(selectFirstActivePlan);
  const plan = useSelector((s: AppState) =>
    selectPlanById(s, { id: activePlan.planId }),
  );

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <StripeProvider>
      <HeroBgView className="flex gap-6">
        <div className="bg-white/90 shadow p-16 lg:block hidden lg:w-[500px] lg:h-screen">
          <div className="text-xl text-black font-bold">
            Launch, grow, and scale your app without worrying about
            infrastructure
          </div>
          <div className="text-lg text-gold font-bold pt-5 pb-1">Launch</div>
          <p>Get up and running without any work or config.</p>
          <hr className="mt-5 mb-4" />
          <div className="text-lg text-gold font-bold pb-1">Grow</div>
          <p>Aptible handles all the infrastructure operations.</p>
          <hr className="mt-5 mb-4" />
          <div className="text-lg text-gold font-bold pb-1">Scale</div>
          <p>
            Enterprise requirements such as performance, security, and
            reliability are baked in from day one.
          </p>
          <p className="text-md text-black pt-8 pb-4 text-center font-semibold">
            Companies that have scaled with Aptible
          </p>
          <img
            src="/customer-logo-cloud.png"
            className="text-center scale-90"
            aria-label="Customer Logos"
          />
          <div className="pt-8 lg:px-0 px-10">
            <CreateProjectFooter />
          </div>
        </div>

        <div className="flex-1 lg:p-16 p-8">
          <Group>
            <div className="flex justify-center">
              <AptibleLogo width={160} />
            </div>

            <div className="text-center">
              <p className="text-gray-900">
                You must enter a credit card to continue using Aptible. <br />
                Your card will be charged at the end of your monthly billing
                cycle.
              </p>
              <h1 className="text-gray-900 text-3xl font-semibold text-center pt-8">
                Add Payment Information
              </h1>
            </div>

            <Banner variant="info" className="w-full">
              <div className="flex items-center gap-2">
                Current plan: {plan.name}{" "}
                <Link to={plansUrl()} className="flex items-center gap-1">
                  Change plan <IconArrowRight variant="sm" color="#4361FF" />
                </Link>
              </div>
            </Banner>

            <div className="bg-white py-8 px-10 shadow rounded-lg border border-black-100 w-full">
              <form className="space-y-4" onSubmit={onSubmitForm}>
                <CardElement />
                <Button type="submit" className="font-semibold w-full">
                  Save Payment
                </Button>
              </form>

              <div className="text-center text-sm">
                <p>
                  Prefer to speak to someone first?{" "}
                  <a href="https://www.aptible.com/contact">Schedule a demo</a>{" "}
                  or go to <Link to={logoutUrl()}>Logout</Link>
                </p>
              </div>
            </div>
          </Group>
        </div>
      </HeroBgView>
    </StripeProvider>
  );
};
