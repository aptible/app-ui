import { Code } from "./code";
import { ExternalLink } from "./external-link";
import { IconChevronDown, IconChevronRight } from "./icons";
import { tokens } from "./tokens";

import { useEffect, useRef, useState } from "react";

export interface HelpTextAccordionProps {
  title: string;
  children: React.ReactNode;
  onChange?: (open: boolean) => void | null;
  onOpen?: () => void | null;
  onClose?: () => void | null;
}

export const HelpTextAccordion = ({
  title,
  children,
  onChange,
  onOpen,
  onClose,
}: HelpTextAccordionProps) => {
  const hasOpened = useRef(false);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    // Skip inital passes so that we only trigger onClose if the user manually
    // closes the accordion. React.StrictMode makes this awkward because each
    // component is mounted twice so we can't simply skip the first trigger.
    if (isOpen) {
      hasOpened.current = true;
    }

    if (!hasOpened.current) {
      return;
    }

    onChange?.(isOpen);

    if (isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [isOpen]);

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

export const DeployAppFooter = () => {
  return (
    <div>
      <h4 className={`${tokens.type.h4} py-4`}>How It Works</h4>
      <hr className="my-1" />

      <div>
        <HelpTextAccordion title="How do I deploy an App with GitHub?">
          <p className="mb-2">
            Click <strong>Deploy from GitHub</strong> and we'll guide you
            through each step:
          </p>
          <ol className="list-decimal list-inside">
            <li>Sign up for an Aptible account</li>
            <li>Create an environment</li>
            <li>
              Add our{" "}
              <ExternalLink href="https://github.com/marketplace/actions/deploy-to-aptible">
                GitHub Action
              </ExternalLink>{" "}
              to your repository
            </li>
            <li>
              Configure your App (e.g. databases, environment variables,
              services and commands)
            </li>
            <li>Push your changes to GitHub</li>
          </ol>
        </HelpTextAccordion>
        <HelpTextAccordion title="How do I deploy an App with Git Push?">
          <p className="mb-2">
            Click <strong>Deploy with Git Push</strong> and we'll guide you
            through each step:
          </p>
          <ol className="list-decimal list-inside">
            <li>Sign up for an Aptible account</li>
            <li>Add an SSH key</li>
            <li>Create an environment</li>
            <li>Deploy a starter template or your own custom code</li>
            <li>
              Configure your App (e.g. databases, environment variables,
              services and commands)
            </li>
            <li>
              Push your code to Aptible using <Code>git push</Code>
            </li>
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
