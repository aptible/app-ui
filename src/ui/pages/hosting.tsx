import { fetchEnvironments, selectEnvironments } from "@app/deploy";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import { environmentsUrl, getStartedUrl, logoutUrl } from "@app/routes";
import { tunaEvent } from "@app/tuna";
import { selectCurrentUser } from "@app/users";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { HeroBgLayout } from "../layouts";
import {
  Banner,
  Box,
  Button,
  CheckBox,
  Code,
  Group,
  HelpTextAccordion,
  IconArrowRight,
  Loading,
  tokens,
} from "../shared";

const SELF_HOSTED_USER_KEY = "self-hosted-user-id";

const TUNA_EVENT_PREFIX = "feedback.hosting";
const hostingTunaEvent = (event: string, data: any = null) => {
  tunaEvent(`${TUNA_EVENT_PREFIX}.${event}`, data);
};

export const HostingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const environmentsLoader = useLoader(fetchEnvironments);
  const environments = useSelector(selectEnvironments);
  const redirectPath = useSelector(selectRedirectPath);

  const [selfHostedChecked, setSelfHostedChecked] = useState(false);
  const hasEnvironments = Object.keys(environments).length > 0;

  const deployNowClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    hostingTunaEvent("aptible_hosted");
    navigate(redirectPath || getStartedUrl());
    dispatch(resetRedirectPath());
  };

  useEffect(() => {
    if (hasEnvironments) {
      navigate(redirectPath || environmentsUrl());
      dispatch(resetRedirectPath());
    }
  }, [hasEnvironments]);

  useEffect(() => {
    setSelfHostedChecked(
      user.id === localStorage.getItem(SELF_HOSTED_USER_KEY),
    );
  }, [user]);

  useEffect(() => {
    // Wait until the page has loaded
    if (environmentsLoader.isInitialLoading) {
      return;
    }

    // Persist user ID to localStorage if the box is checked so that if they
    // log in as another user the option is still available. It's not perfect
    // but it's sufficient for the task of gauging intereset in self-hosted.
    if (selfHostedChecked) {
      localStorage.setItem(SELF_HOSTED_USER_KEY, user.id);
      hostingTunaEvent("self_hosted_waitlist.true");
    } else {
      localStorage.removeItem(SELF_HOSTED_USER_KEY);
      hostingTunaEvent("self_hosted_waitlist.false");
    }
  }, [selfHostedChecked]);

  if (environmentsLoader.isInitialLoading || hasEnvironments) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <HeroBgLayout width={1200}>
      <Group className="items-center">
        <h1 className={`${tokens.type.h1} text-center`}>Choose an Option</h1>

        {selfHostedChecked ? (
          <Banner variant="success" className="w-full">
            Successfully added to Early Access! Someone from Aptible will reach
            out to connect.
          </Banner>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <Box className="hover:bg-orange-100 hover:border-orange-500">
            <Group className="items-center justify-between h-full">
              <Code className="text-forest bg-lime-100 pt-1 px-2">
                AVAILABLE NOW
              </Code>
              <h2 className={`${tokens.type.h2} text-center`}>
                Launch a new project
              </h2>
              <div className="text-center">
                Use Aptible to deploy apps and managed databases{" "}
                <b>hosted on Aptible</b>. Your invoice is based on how much
                infrastructure you use.
              </div>
              <Button onClick={deployNowClick} className="w-full">
                Deploy Now <IconArrowRight />
              </Button>
              <img src="/aptible-hosted-img.png" aria-label="Aptible-Hosted" />
            </Group>
          </Box>
          <Box className="hover:bg-orange-100 hover:border-orange-500">
            <Group className="items-center justify-between h-full">
              <Code className="text-maroon-500 bg-maroon-100 pt-1 px-2">
                COMING SOON
              </Code>
              <h2
                className={`${tokens.type.h2} text-center mx-auto max-w-[24ch]`}
              >
                Launch a platform on your existing infrastructure
              </h2>
              <div className="text-center">
                Use Aptible to analyze and standardize infrastructure already
                running in <b>your own cloud account</b>. Your invoice is based
                on services managed by Aptible and team size.
              </div>
              <CheckBox
                label="Request Early Access"
                checked={selfHostedChecked}
                onChange={(e) => setSelfHostedChecked(e.currentTarget.checked)}
              />
              <img src="/self-hosted-img.png" aria-label="Self-Hosted" />
            </Group>
          </Box>
        </div>

        <div className="w-full">
          <h3 className={`${tokens.type.h3} py-4`}>FAQ</h3>
          <hr className="my-1" />

          <div>
            <HelpTextAccordion
              title="What’s the difference between the two options?"
              onChange={(open) =>
                hostingTunaEvent(`faq.difference.${open ? "open" : "close"}`)
              }
            >
              <Group className="mb-2">
                <p>
                  Hundreds of the fastest growing startups and scaling companies
                  have used Aptible’s hosted platform for a decade. In this
                  option, Aptible hosts and manages your resources, abstracting
                  away all the complexity of interacting with an underlying
                  cloud provider and ensuring resources are provisioned
                  properly.
                </p>
                <p>
                  Aptible also manages existing resources hosted in your own
                  cloud account. This means that you integrate Aptible with your
                  cloud accounts and Aptible helps your platform engineering
                  team create a platform on top of the infrastructure you
                  already have. In this option, you control and pay for your own
                  cloud accounts, while Aptible helps you analyze and
                  standardize your cloud resources.
                </p>
              </Group>
            </HelpTextAccordion>
            <HelpTextAccordion
              title="Is there a free trial?"
              onChange={(open) =>
                hostingTunaEvent(`faq.free_trial.${open ? "open" : "close"}`)
              }
            >
              <Group className="mb-2">
                <p>
                  Yes. There is a 30 day free trial for launching a new project
                  on Aptible hosted resources.
                </p>
                <p>
                  At this time, we are accepting requests for Early Access to
                  use Aptible to launch a platform in your existing cloud
                  accounts. Early Access customers will get Proof of
                  Concept/Value periods.
                </p>
              </Group>
            </HelpTextAccordion>
            <HelpTextAccordion
              title="Why do I have to Request Early Access to work within my existing cloud accounts?"
              onChange={(open) =>
                hostingTunaEvent(
                  `faq.early_access_request.${open ? "open" : "close"}`,
                )
              }
            >
              <p className="mb-2">
                Customer feedback is central to everything Aptible has ever
                released. As we are aggressively expanding our ability to manage
                existing cloud infrastructure, we’ve decided to offer white
                glove onboarding to select customers interested in using us to
                manage their existing resources. The catch? We’re looking for
                feedback so we’ll expect you to help us set our roadmap and
                rapidly improve our functionality.
              </p>
            </HelpTextAccordion>
          </div>
        </div>

        <Link to={logoutUrl()} className="font-semibold mt-4">
          Log Out
        </Link>
      </Group>
    </HeroBgLayout>
  );
};
