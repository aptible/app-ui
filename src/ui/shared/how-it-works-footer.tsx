import { Code } from "./code";
import { ExternalLink } from "./external-link";
import { IconChevronDown, IconChevronRight } from "./icons";
import { tokens } from "./tokens";

import { useState } from "react";

export const HelpTextAccordion = ({
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
            <IconChevronDown className="w-[30px]" />
          ) : (
            <IconChevronRight className="w-[30px]" />
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
      <h4 className={`${tokens.type.h4} py-4`}>How It Works</h4>
      <hr className="my-1" />

      <div>
        <HelpTextAccordion title="How do I deploy an App?">
          <ol className="list-decimal list-inside">
            <li>Sign up for an Aptible account</li>
            <li>Add an SSH key</li>
            <li>Create an environment</li>
            <li>Deploy a starter template or your own custom code</li>
            <li>
              Push your code to Aptible using <Code>git push</Code>
            </li>
            <li>
              Configure your App (e.g. databases, environment variables,
              services and commands)
            </li>
            <li>Save and deploy</li>
          </ol>
        </HelpTextAccordion>
        <HelpTextAccordion title="Is my App a good fit for Aptible?">
          <p className="my-2">
            Broadly speaking, if your App is containerized, and aligns well with
            the{" "}
            <ExternalLink href="https://12factor.net/" variant="info">
              Twelve-Factor
            </ExternalLink>{" "}
            App model, you will find Aptible's features to be familiar and
            in-line with your expectations.
          </p>
        </HelpTextAccordion>
        <HelpTextAccordion title="What if my App isn't containerized?">
          <p className="my-2">
            Aptible scans the code you push up and automatically builds a Docker
            image for you.
          </p>
        </HelpTextAccordion>
      </div>
    </div>
  );
};
