import { addCreditCard, getStripe, selectBillingDetail } from "@app/billing";
import { selectEnv } from "@app/config";
import {
  fetchActivePlans,
  fetchPlans,
  selectFirstActivePlan,
  selectPlanByActiveId,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { homeUrl, logoutUrl, plansUrl } from "@app/routes";
import { existValidator } from "@app/validator";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useValidator } from "../hooks";
import { HeroBgView } from "../layouts";
import {
  AptibleLogo,
  Banner,
  BannerMessages,
  Button,
  FormGroup,
  Group,
  IconArrowRight,
  Input,
  Label,
  OrgPicker,
} from "../shared";

const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  const env = useSelector(selectEnv);
  const stripe = useMemo(() => {
    return getStripe(env.stripePublishableKey);
  }, [env.stripePublishableKey]);
  return <Elements stripe={stripe}>{children}</Elements>;
};

interface FormProps {
  zipcode: string;
  nameOnCard: string;
}

const validators = {
  zipcode: (p: FormProps) => {
    return existValidator(p.zipcode, "zipcode");
  },
  name: (p: FormProps) => {
    return existValidator(p.nameOnCard, "name on card");
  },
};

const CreditCardForm = () => {
  const billingDetail = useSelector(selectBillingDetail);
  const navigate = useNavigate();
  const elements = useElements();
  const stripe = useStripe();
  const dispatch = useDispatch();
  const [nameOnCard, setNameOnCard] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [error, setError] = useState("");
  const loader = useLoader(addCreditCard);
  const [loading, setLoading] = useState(false);
  const [errors, validate] = useValidator<FormProps, typeof validators>(
    validators,
  );
  const data = { zipcode, nameOnCard };

  useLoaderSuccess(loader, () => {
    navigate(homeUrl());
  });

  async function submit() {
    if (!validate(data)) {
      return;
    }

    if (!stripe || !elements) {
      throw new Error("stripe not found");
    }

    const result = await elements.submit();
    if (result.error) {
      throw new Error(result.error.message || "unknown");
    }

    const element = elements.getElement(CardNumberElement);
    if (!element) {
      throw new Error("stripe card number element not found");
    }

    const token = await stripe.createToken(element, {
      name: nameOnCard,
      address_zip: zipcode,
    });
    if (token.error) {
      throw new Error(token.error.message || "unknown");
    }

    const stripeTokenId = token.token?.id || "";
    dispatch(addCreditCard({ id: billingDetail.id, stripeTokenId }));
    return stripeTokenId;
  }

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    submit()
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Group>
      {error ? <Banner variant="error">{error}</Banner> : null}
      <BannerMessages {...loader} />

      <div className="flex flex-col gap-0">
        <Label>Organization</Label>
        <OrgPicker />
      </div>

      <form className="space-y-4" onSubmit={onSubmitForm}>
        <Label>
          <span>Credit Card Number</span>
          <div className="p-3 border border-gray-300 rounded-md shadow-sm">
            <CardNumberElement />
          </div>
        </Label>

        <div className="flex flex-row gap-4">
          <div className="w-1/2">
            <Label>
              <span>Expiration Date</span>
              <div className="p-3 border border-gray-300 rounded-md shadow-sm">
                <CardExpiryElement />
              </div>
            </Label>
          </div>

          <div className="w-1/2">
            <Label>
              <span>CVC</span>
              <div className="p-3 border border-gray-300 rounded-md shadow-sm">
                <CardCvcElement />
              </div>
            </Label>
          </div>
        </div>

        <FormGroup
          label="Name on Card"
          htmlFor="name-on-card"
          feedbackVariant={errors.name ? "danger" : "info"}
          feedbackMessage={errors.name}
        >
          <Input
            id="name-on-card"
            name="name-on-card"
            type="text"
            autoComplete="name-on-card"
            required
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
          />
        </FormGroup>

        <FormGroup
          label="Zipcode"
          htmlFor="zipcode"
          className="flex-1"
          feedbackVariant={errors.zipcode ? "danger" : "info"}
          feedbackMessage={errors.zipcode}
        >
          <Input
            name="zipcode"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            required
          />
        </FormGroup>

        <Button
          type="submit"
          className="font-semibold w-full"
          isLoading={loader.isLoading || loading}
        >
          Save Payment
        </Button>
      </form>
    </Group>
  );
};

export const BillingMethodPage = () => {
  const org = useSelector(selectOrganizationSelected);
  useQuery(fetchActivePlans({ orgId: org.id }));
  useQuery(fetchPlans());
  const activePlan = useSelector(selectFirstActivePlan);
  const plan = useSelector((s) =>
    selectPlanByActiveId(s, { id: activePlan.planId }),
  );

  return (
    <StripeProvider>
      <HeroBgView className="flex gap-6">
        <div className="bg-white/90 shadow p-12 lg:block hidden lg:w-[500px] h-fit min-h-screen">
          <div className="text-xl text-black font-bold">
            Try the platform hundreds of scaling engineering teams use to
            achieve enterprise best practices for their infrastructure
          </div>
          <div className="text-lg text-gold font-bold pt-5 pb-1">
            Control your Infrastructure
          </div>
          <p>
            Manage your entire infrastructure, optimize cloud spending, and
            prevent vendor lock-in.
          </p>
          <hr className="mt-5 mb-4" />
          <div className="text-lg text-gold font-bold pb-1">
            Ensure Reliability
          </div>
          <p>
            Aptible fully monitors your entire compute and data resources, and
            holds the pager 24x7 for your infrastructure.
          </p>
          <hr className="mt-5 mb-4" />
          <div className="text-lg text-gold font-bold pb-1">
            Achieve Best Practices
          </div>
          <p>
            Get the flexibility that scaling companies need: support non-HTTPS
            services; enforce fine-grained RBAC; comply with security
            frameworks; and scale to the limits of AWS for containers, disks, or
            backups.
          </p>
          <p className="text-md text-black pt-8 pb-4 text-center font-semibold">
            Companies that have scaled with Aptible
          </p>
          <img
            src="/customer-logo-cloud.png"
            className="text-center scale-90 pb-[200px]"
            aria-label="Customer Logos"
          />
        </div>

        <div className="flex-1 mx-auto max-w-[500px]">
          <Group>
            <div className="flex justify-center pt-[65px] pb-4">
              <AptibleLogo width={160} />
            </div>

            <Group className="items-center">
              <p className="text-gray-900 text-center">
                You must enter a credit card to continue using Aptible. <br />
                Your card will be charged at the end of your monthly billing
                cycle.
              </p>
              <h1 className="text-gray-900 text-3xl font-semibold text-center">
                Add Payment Information
              </h1>
            </Group>

            <Banner variant="info" className="w-full">
              <div className="flex items-center gap-2">
                Current plan: {plan.name}{" "}
                <Link to={plansUrl()} className="flex items-center gap-1">
                  Change plan <IconArrowRight variant="sm" color="#4361FF" />
                </Link>
              </div>
            </Banner>

            <div className="bg-white py-8 px-10 shadow rounded-lg border border-black-100 w-full">
              <CreditCardForm />

              <div className="text-center text-sm mt-4">
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
