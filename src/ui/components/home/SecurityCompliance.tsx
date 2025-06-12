import { CheckCircleIcon, InformationCircleIcon, BookOpenIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectStacksByOrgAsList,
  getStackType,
} from "@app/deploy";
import { Tooltip } from "../../shared";
import type { WebState } from "@app/schema";

interface SecurityBoxProps {
  title: string;
  description: React.ReactNode;
  tooltip?: string;
  isLoading?: boolean;
  hasDedicatedStack?: boolean;
  children?: React.ReactNode;
}

const SecurityBox = ({ title, description, tooltip, isLoading = false, hasDedicatedStack = false, children }: SecurityBoxProps) => {
  const isInProgress = title === "HIPAA Addressable Controls" || title === "HITRUST Controls";
  const isHipaaRequired = title === "HIPAA Required Controls";

  const getBackgroundColor = () => {
    if (isLoading) return 'bg-gray-50 border-gray-200';
    if (isInProgress) return 'bg-gray-50 border-gray-200';
    if (isHipaaRequired) {
      return hasDedicatedStack ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200';
    }
    return 'bg-emerald-50 border-emerald-200';
  };

  const getIconColor = () => {
    if (isLoading) return 'text-gray-400';
    if (isInProgress) return 'text-gray-600';
    if (isHipaaRequired) {
      return hasDedicatedStack ? 'text-emerald-600' : 'text-orange-600';
    }
    return 'text-emerald-600';
  };

  return (
    <div className={`p-4 rounded-lg border shadow flex flex-col justify-between h-full ${getBackgroundColor()}`}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
          ) : isInProgress ? (
            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <CheckCircleIcon className={`w-5 h-5 ${getIconColor()}`} />
          )}
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {tooltip && (
            <Tooltip text={tooltip}>
              <InformationCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
            </Tooltip>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {isLoading ? (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-gray-500">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading compliance data...</span>
          </div>
        </div>
      ) : children}
    </div>
  );
};

const ResourceCard = ({ icon, title, href }: { icon: React.ReactNode, title: string, href: string }) => (
  <a href={href} className="block h-full" target="_blank" rel="noopener noreferrer">
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 h-full">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 text-gray-500">{icon}</span>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
    </div>
  </a>
);

export const SecurityCompliance = () => {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const stacks = useSelector((state: WebState) => selectStacksByOrgAsList(state));

  // Track when data has loaded
  useEffect(() => {
    if (stacks && !hasInitiallyLoaded) {
      // Add a small delay to ensure smooth loading experience
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stacks, hasInitiallyLoaded]);

  // Loading states - show loading if data hasn't loaded yet OR if we haven't marked as initially loaded
  const isStacksLoading = !stacks || !hasInitiallyLoaded;

  // Check if user has any dedicated stacks - simplified check
  const hasDedicatedStack = !isStacksLoading && stacks ? Object.values(stacks).some(stack => getStackType(stack) === 'dedicated') : false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Security & Compliance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SecurityBox
            title="Infrastructure Security"
            description={
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Aptible implements and manages the infrastructure security controls required to meet compliance with frameworks such as HIPAA, HITRUST, SOC 2 Type 2, and PCI DSS for Service Providers Level 2.{' '}
                  <a
                    href="https://trust.aptible.com/"
                    className="text-blue-600 hover:text-blue-800 font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Trust Center →
                  </a>
                </p>
              </div>
            }
          />
          <SecurityBox
            title="HIPAA Required Controls"
            description="Automate and enforce 100% of the HIPAA Required infrastructure controls with a Dedicated Stack."
            isLoading={isStacksLoading}
            hasDedicatedStack={hasDedicatedStack}
          >
            <div className="mt-4">
              <a
                href="https://dashboard.aptible.com/controls"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Controls
              </a>
            </div>
          </SecurityBox>
          <SecurityBox
            title="HIPAA Addressable Controls"
            description="Implement the HIPAA Addressable infrastructure controls within the Security & Compliance Dashboard"
            isLoading={isStacksLoading}
          >
            <div className="mt-4">
              <a
                href="https://dashboard.aptible.com/controls"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Controls
              </a>
            </div>
          </SecurityBox>
          <SecurityBox
            title="HITRUST Controls"
            description="Implement the available HITRUST Inheritable Controls within the Security & Compliance Dashboard"
            isLoading={isStacksLoading}
          >
            <div className="mt-4">
              <a
                href="https://dashboard.aptible.com/controls"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Controls
              </a>
            </div>
          </SecurityBox>
        </div>
      </div>

      <div>
        <hr className="border-t border-gray-200 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ResourceCard
            icon={<BookOpenIcon />}
            title="Docs"
            href="https://www.aptible.com/docs"
          />
          <ResourceCard
            icon={<QuestionMarkCircleIcon />}
            title="Support"
            href="https://app.aptible.com/support"
          />
        </div>
      </div>
    </div>
  );
}; 