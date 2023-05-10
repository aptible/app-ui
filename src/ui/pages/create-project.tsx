import {
  AptibleLogo,
  Box,
  Button,
  ButtonIcon,
  ButtonLink,
  ExternalLink,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconThumbsUp,
  tokens,
} from "../shared";
import { createProjectGitUrl } from "@app/routes";
import { useState } from "react";

const HelpTextAccordion = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <div className="py-4">
        <div
          className="flex cursor-pointer"
          onKeyUp={() => setOpen(!isOpen)}
          onClick={() => setOpen(!isOpen)}
        >
          {isOpen ? (
            <IconChevronUp className="w-[30px]" />
          ) : (
            <IconChevronDown className="w-[30px]" />
          )}
          <span className="flex-1 font-bold">{title}</span>
        </div>
        {isOpen ? (
          <div className="flex mt-2">
            <div className="w-[30px]" />
            <div className="flex-1">{children}</div>
          </div>
        ) : null}
      </div>
      <hr className="my-1" />
    </>
  );
};

const CreateProjectFooter = () => {
  return (
    <div>
      <h4 className={`${tokens.type.h4} py-4`}>How it works</h4>
      <hr className="my-1" />

      <div>
        <HelpTextAccordion title="How do I deploy an App?">
          <p className="my-2">
            Aptible's platform is production-ready from day one and provides the
            scalability you need.
          </p>
          <ol className="list-decimal list-inside">
            <li>Signup for an account</li>
            <li>Add your public SSH key</li>
            <li>Create an environment</li>
            <li>Push your code to our Git server</li>
            <li>
              Configure your App (e.g. databases, environment variable, services
              and commands)
            </li>
            <li>Save & Deploy</li>
          </ol>
        </HelpTextAccordion>
        <HelpTextAccordion title="Is my App a good fit for Aptible?">
          <p className="my-2">
            Broadly speaking, if your App is already containerized, and aligns
            well with the{" "}
            <ExternalLink href="https://12factor.net/" variant="info">
              Twelve-Factor
            </ExternalLink>{" "}
            App model, you will likely find Aptible’s features to be familiar
            and in-line with your expectations. However, the Aptible platform’s
            architecture is opinionated and is not suitable for every type of
            application.
          </p>
          <div className="text-black font-bold">Containerization</div>
          <p className="my-2">
            Aptible only supports running Docker Containers. Most applications
            you have written yourself will be easy to containerize, if they are
            not already.
          </p>
          <div className="text-black font-bold">Transport Protocol</div>
          <p className="my-2">
            All services you host on Aptible must be explicitly exposed via{" "}
            <ExternalLink
              href="https://deploy-docs.aptible.com/docs/endpoints"
              variant="info"
            >
              Endpoints
            </ExternalLink>
            , which only support exposing TCP-based services. You will not be
            able to serve UDP services from Aptible. You may still connect to
            UDP services (such as DNS, SNMP, etc) from Applications hosted on
            Aptible.
          </p>
          <div className="text-black font-bold">Data Persistence</div>
          <p className="my-2">
            With the notable exception of Database data, the filesystem for your
            Containers is ephemeral. This means that every time your containers
            are recycled, any data you stored on the filesystem will be gone. As
            a result, you should make sure you never use the filesystem for data
            you need to retain long term. Instead, this data should be stored in
            a Database or in a third-party storage solution, such as AWS S3.
            Applications that rely on persistent local storage, or a volume
            shared between multiple containers, will need to be re-architected.
          </p>
        </HelpTextAccordion>
        <HelpTextAccordion title="What if my App isn't containerized?">
          <p className="my-2">
            We will scan the code you push up and try to automatically build a
            Docker image for you.
          </p>
        </HelpTextAccordion>
      </div>
    </div>
  );
};

export const CreateProjectPage = () => {
  const [surveyDockerPushSet, setSurveyDockerPushSet] =
    useState<boolean>(false);
  const [surveyDockerComposeSet, setSurveyDockerComposeSet] =
    useState<boolean>(false);
  const [surveyGithubIntegrationSet, setSurveyGithubIntegration] =
    useState<boolean>(false);

  // TODO
  // add a submission async function that will:
  // 1. save that someone stored to state
  // 1a. if someone previously voted, hide this form from state (as it will be rehydrated from redux reducer)
  // 1b. group things, send each separately as an event to tuna
  // 2. after promise.all equivalent is complete, go to deploy. ignore all errors as we send it over

  return (
    <div
      className="flex flex-col flex-1 h-full bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/background-pattern-v2.png)",
      }}
    >
      <main className="flex-1">
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4">
              <div className="flex justify-center container">
                <div style={{ width: 500 }}>
                  <div className="flex items-center justify-center mb-5">
                    <AptibleLogo width={160} />
                  </div>
                  <div className="text-center mt-16">
                    <h1 className={tokens.type.h1}>Deploy your App</h1>
                    <p className="my-6 text-gray-600">
                      Aptible is the{" "}
                      <span className="text-black font-bold">
                        No Infrastructure
                      </span>{" "}
                      Platform as a Service that startups use to deploy in
                      seconds, scale infinitely, and forget about
                      infrastructure.
                    </p>
                  </div>
                  <Box>
                    <ButtonLink
                      to={createProjectGitUrl()}
                      className="font-bold"
                    >
                      Deploy with Git Push
                      <IconArrowRight className="ml-2" />
                    </ButtonLink>
                    <hr className="h-px mt-8 mb-4 bg-gray-200 border-0 dark:bg-gray-700" />
                    <h4 className={`${tokens.type.h4} text-center py-4`}>
                      What should Aptible build next?
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex">
                        <Button
                          className="w-full pointer-events-none text-bold text-gray-500"
                          variant="white"
                          disabled
                        >
                          Deploy with Docker Push
                        </Button>
                        <ButtonIcon
                          className="ml-4"
                          onClick={() =>
                            setSurveyDockerPushSet(!surveyDockerPushSet)
                          }
                          icon={
                            surveyDockerPushSet ? (
                              <IconCheck
                                color={surveyDockerPushSet ? "#FFF" : undefined}
                              />
                            ) : (
                              <IconThumbsUp />
                            )
                          }
                          variant={surveyDockerPushSet ? "success" : "primary"}
                        />
                      </div>
                      <div className="flex">
                        <Button
                          className="w-full pointer-events-none text-bold text-gray-500"
                          variant="white"
                        >
                          Deploy with Docker Compose
                        </Button>
                        <ButtonIcon
                          className="ml-4"
                          onClick={() =>
                            setSurveyDockerComposeSet(!surveyDockerComposeSet)
                          }
                          icon={
                            surveyDockerComposeSet ? (
                              <IconCheck
                                color={
                                  surveyDockerComposeSet ? "#FFF" : undefined
                                }
                              />
                            ) : (
                              <IconThumbsUp />
                            )
                          }
                          variant={
                            surveyDockerComposeSet ? "success" : "primary"
                          }
                        />
                      </div>
                      <div className="flex">
                        <Button
                          className="w-full pointer-events-none text-bold text-gray-500"
                          variant="white"
                        >
                          Deploy with Github Integration
                        </Button>
                        <ButtonIcon
                          className="ml-4"
                          onClick={() =>
                            setSurveyGithubIntegration(
                              !surveyGithubIntegrationSet,
                            )
                          }
                          icon={
                            surveyGithubIntegrationSet ? (
                              <IconCheck
                                color={
                                  surveyGithubIntegrationSet
                                    ? "#FFF"
                                    : undefined
                                }
                              />
                            ) : (
                              <IconThumbsUp />
                            )
                          }
                          variant={
                            surveyGithubIntegrationSet ? "success" : "primary"
                          }
                        />
                      </div>
                    </div>
                  </Box>

                  <div className="mt-6">
                    <CreateProjectFooter />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
