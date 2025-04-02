import type { Message } from "@app/aptible-ai";
import { StreamingText } from "../llm";

const AptibleMark = () => (
  <img
    src="/aptible-mark.png"
    className="w-[24px] h-[24px] mr-3 mt-1.5"
    aria-label="App"
  />
);

export const DiagnosticsMessages = ({
  messages,
  showAllMessages,
  setShowAllMessages,
  loadingComplete,
}: {
  messages: Message[];
  showAllMessages: boolean;
  setShowAllMessages: (show: boolean) => void;
  loadingComplete: boolean;
}) => {
  let messagesToShow: Message[] = [];
  if (showAllMessages) {
    messagesToShow = messages;
  } else if (!loadingComplete) {
    messagesToShow = messages.slice(-1);
  }

  const shouldAnimate = (index: number) => {
    if (loadingComplete) {
      return false;
    }

    if (messages && showAllMessages) {
      return index === messages.length - 1;
    }
    return true;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Messages</h2>
        {messages && messages.length > 1 && (
          <button
            type="button"
            onClick={() => setShowAllMessages(!showAllMessages)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showAllMessages ? "Show Latest" : `Show All (${messages.length})`}
          </button>
        )}
      </div>
      <div className="space-y-6">
        {messagesToShow.map((message, index) => (
          <div key={message.id} className="flex items-start">
            <AptibleMark />
            <div className="flex-1 bg-white rounded-lg px-4 py-2 shadow-sm">
              <StreamingText
                text={message.message}
                showEllipsis={!loadingComplete}
                animate={shouldAnimate(index)}
              />
            </div>
          </div>
        ))}

        {loadingComplete ? (
          <div key="complete" className="flex items-start">
            <AptibleMark />
            <div className="flex-1 bg-white rounded-lg px-4 py-2 shadow-sm">
              <StreamingText
                text="Analysis complete."
                showEllipsis={false}
                animate={false}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
