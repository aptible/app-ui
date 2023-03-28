import { BannerMessages } from "./banner-messages";
import { Button } from "./button";
import { FormGroup } from "./form-group";
import { Input } from "./input";
import { tokens } from "./tokens";
import { addSSHKey } from "@app/ssh-keys";
import { selectCurrentUserId } from "@app/users";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoader, useLoaderSuccess } from "saga-query/react";

export const AddSSHKeyForm = ({
  onSuccess = () => {},
}: {
  onSuccess?: () => void;
}) => {
  const userId = useSelector(selectCurrentUserId);
  const dispatch = useDispatch();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const loader = useLoader(addSSHKey);

  const addKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(addSSHKey({ userId, name, key }));
  };

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  return (
    <div>
      <h2 className={tokens.type.h3}>Public SSH Key</h2>
      <p className="text-gray-600 mb-2">
        Copy the contents of the file <code>$HOME/.ssh/id_rsa.pub</code> then
        paste here. Need Help? View Docs
      </p>

      <form onSubmit={addKey}>
        <FormGroup label="Name" htmlFor="name" feedbackVariant="info">
          <Input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="username"
          />
          <div>Pick a name that helps you remember this key</div>
        </FormGroup>

        <FormGroup
          label="Public Key"
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
            disabled={!(key && name)}
            isLoading={loader.isLoading}
          >
            Save Key
          </Button>
        </div>
      </form>
    </div>
  );
};
