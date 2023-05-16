import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoader, useLoaderSuccess } from "saga-query/react";

import { prettyDate } from "@app/date";
import { addSSHKey } from "@app/ssh-keys";
import { selectCurrentUserId } from "@app/users";

import { BannerMessages } from "./banner";
import { Button } from "./button";
import { FormGroup } from "./form-group";
import { PreCode } from "./pre-code";
import { tokens } from "./tokens";

export const AddSSHKeyForm = ({
  onSuccess = () => {},
}: {
  onSuccess?: () => void;
}) => {
  const userId = useSelector(selectCurrentUserId);
  const dispatch = useDispatch();
  const [key, setKey] = useState("");
  const loader = useLoader(addSSHKey);

  const addKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = prettyDate(new Date().toISOString());
    dispatch(addSSHKey({ userId, name, key }));
  };

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  return (
    <div>
      <div>
        <h4 className={tokens.type.h4}>Step 1. Copy Public SSH Key</h4>
        <p className="text-gray-600 mb-2">
          Copy your public key to the clipboard. If you're not sure what your
          public key is, the following command will automatically print your SSH
          key from the ssh-agent or the default SSH directory:
        </p>
        <PreCode
          allowCopy
          segments={[
            { text: "ssh-add", className: "text-lime" },
            { text: "-L", className: "text-white" },
            { text: "||", className: "text-indigo" },
            { text: "cat", className: "text-lime" },
            { text: "~/.ssh/*.pub", className: "text-white" },
          ]}
        />
        <p className="text-gray-600 mt-2">
          If you want to generate a new SSH key or want to learn how Aptible
          uses your key,{" "}
          <a href="https://www.aptible.com/docs/public-key-authentication">
            view our docs
          </a>
        </p>
      </div>

      <div className="mt-2">
        <h4 className={tokens.type.h4} />
        <form onSubmit={addKey}>
          <FormGroup
            label="Step 2. Paste Public SSH Key"
            htmlFor="public-key"
            feedbackVariant="info"
          >
            <textarea
              className={tokens.type.textarea}
              value={key}
              onChange={(e) => setKey(e.currentTarget.value)}
            />
          </FormGroup>

          {loader.isError ? <BannerMessages {...loader} /> : null}

          <div>
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={!key}
              isLoading={loader.isLoading}
            >
              Save Key
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
