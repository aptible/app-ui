import type { Message } from "@app/aptible-ai";
import { StreamingText } from "../llm";

export const DiagnosticsMessages = ({
  messages,
  showAllMessages,
  setShowAllMessages,
}: {
  messages: Message[];
  showAllMessages: boolean;
  setShowAllMessages: (show: boolean) => void;
}) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Messages</h2>
        {messages.length > 1 && (
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
        {(showAllMessages ? messages : messages.slice(-1)).map(
          (message, index) => (
            <div key={message.id} className="flex items-start">
              <img
                src={
                  message.id === "completion-message"
                    ? "/aptible-mark.png"
                    : "/thinking.gif"
                }
                className="w-[28px] h-[28px] mr-3"
                aria-label="App"
              />
              <div className="flex-1 bg-white rounded-lg px-4 py-2 shadow-sm">
                <StreamingText
                  text={message.message}
                  showEllipsis={
                    (showAllMessages ? index === messages.length - 1 : true) &&
                    message.id !== "completion-message"
                  }
                  animate={
                    showAllMessages ? index === messages.length - 1 : true
                  }
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};
