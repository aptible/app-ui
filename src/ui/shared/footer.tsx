import { SyntheticEvent, useState } from "react";
import { FeedbackForm } from "./feedback";
import { IconChevronDown, IconChevronUp, IconExternalLink } from "./icons";

export const Footer = () => {
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const handleExpandFeedback = (e: SyntheticEvent) => {
    e.preventDefault();
    setShowFeedback(!showFeedback);
  };
  return (
    <div>
      <div className="flex border-t border-black-100 py-4 px-0 mt-8">
        <p className="grow text-gray-500 text-sm uppercase">
          Aptible, Inc. &copy; {new Date().getFullYear()}
        </p>
        <div className="flex md:flex-row flex-col">
          <span
            className="flex-none text-gray-500 cursor-pointer hover:text-indigo focus:text-gray-500 text-sm pl-4 uppercase"
            onKeyPress={handleExpandFeedback}
            onClick={handleExpandFeedback}
          >
            Share Feedback{" "}
            {showFeedback ? (
              <IconChevronUp className="inline h-5 -ml-2 -mt-1 opacity-60" />
            ) : (
              <IconChevronDown className="inline h-5 -ml-2 -mt-1 opacity-60" />
            )}
          </span>
          <a
            href="https://github.com/aptible/app-ui"
            target="_blank"
            className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 uppercase hidden md:block"
            rel="noreferrer"
          >
            GitHub Repo{" "}
            <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" />
          </a>
          <a
            href="https://www.aptible.com/changelog"
            target="_blank"
            className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 uppercase hidden md:block"
            rel="noreferrer"
          >
            Changelog{" "}
            <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" />
          </a>
          <a
            href="https://dashboard.aptible.com/login"
            target="_blank"
            className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 uppercase hidden md:block"
            rel="noreferrer"
          >
            Legacy Dashboard{" "}
            <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" />
          </a>
        </div>
      </div>
      {showFeedback ? (
        <FeedbackForm
          feedbackEventName="feedback.survey.general_feedback"
          description="What would you like to change about this experience?"
        />
      ) : null}
    </div>
  );
};
