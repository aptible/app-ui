import { CommandLineIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { AppSidebarLayout } from "../layouts";
import {
  Overview,
  ActivityFeed,
  PinnedResources,
  Scaling,
  Sources,
  SecurityCompliance
} from '../components/home';
import {
  Banner,
  IconChevronRight,
  IconX,
} from "../shared";

export const HomePage = () => {
  const [showWhatsNew, setShowWhatsNew] = useState(true);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(true);

  const handleDismiss = () => {
    setShowFeedbackBanner(false);
    // Keeping localStorage code commented out for future use
    // localStorage.setItem('feedbackBannerDismissed', 'true');
  };

  return (
    <div className="relative">
      <AppSidebarLayout>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Home</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://app.aptible.com/sso/cli"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CommandLineIcon className="w-5 h-5" />
                SSO CLI Token
              </a>
              <a
                href="https://www.aptible.com/docs/reference/aptible-cli/overview"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CommandLineIcon className="w-5 h-5" />
                Install the CLI
              </a>
            </div>
          </div>
          <div className="p-6 space-y-8">
            {/* Temporarily hidden What's New section
            {showWhatsNew && (
              <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-medium text-gray-900">What's New</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://www.aptible.com/changelog"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View All Updates →
                    </a>
                    <button
                      onClick={() => setShowWhatsNew(false)}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Dismiss"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">March Enhancements - Operation Logs, Terraform, CLI, and more</h3>
                  <p className="mt-1 text-sm text-gray-600">Better differentiate the output of container logs from platform logs in operations, improvements to Terraform provider, CLI updates, and UI enhancements.</p>
                </div>
              </div>
            )}
            */}

            <div className="space-y-6">
              {/* Overview Section */}
              <Overview />

              {/* Activity Feed and Pinned Resources Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left column - Activity Feed */}
                <div>
                  <ActivityFeed />
                  {/* <RecentActivity /> - Hidden for now */}
                </div>

                {/* Right column - Pinned Resources */}
                <div>
                  <PinnedResources />
                </div>
              </div>

              {/* Scaling and Sources Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Scaling />
                <Sources />
              </div>

              {/* Bottom section */}
              <SecurityCompliance />
            </div>
          </div>
        </div>
      </AppSidebarLayout>

      {/* Beta Feedback Banner */}
      {showFeedbackBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Banner variant="info" className="shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold mb-1">Share feedback</div>
                <div className="text-sm text-gray-600">
                  This landing page is in BETA. Have feedback? Experiencing a bug? Let us know!
                </div>
                <div className="mt-2">
                  <a
                    href="https://portal.productboard.com/aptible/2-aptible-roadmap-portal/tabs/5-under-consideration/submit-idea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    Share Feedback
                    <IconChevronRight variant="sm" className="ml-1" />
                  </a>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Dismiss feedback banner"
              >
                <IconX variant="sm" />
              </button>
            </div>
          </Banner>
        </div>
      )}
    </div>
  );
};
