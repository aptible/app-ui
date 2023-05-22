import { ExternalLink } from "./external-link";
import { IconChevronDown, IconChevronUp } from "./icons";
import { tokens } from "./tokens";

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

export const CreateProjectFooter = () => {
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
