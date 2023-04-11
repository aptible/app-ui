import { useState } from "react";
import { useSelector } from "react-redux";
import { useCache } from "saga-query/react";

import { fetchU2fChallenges } from "@app/mfa";
import { selectCurrentUserId } from "@app/users";

import { Banner, Button, ExternalLink, FormGroup } from "../shared";

interface U2fChallenge {
  id: string;
  challenge: string;
}

export const AddSecurityKeyPage = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const userId = useSelector(selectCurrentUserId);
  const challenge = useCache<U2fChallenge>(fetchU2fChallenges({ userId }));

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log(challenge.data);
    event.preventDefault();
    if (!name) {
      setError("name must not be blank");
      return;
    }

    if (challenge.isError) {
      setError(challenge.message);
      return;
    }

    if (!challenge.data) {
      setError("could not load u2f challenge");
      return;
    }

    /* try {
      await ensureSupport();
    } catch (err: any) {
      console.log(err);
      setError(err.message);
      return;
    } */

    setError("");
  };

  return (
    <div>
      <div>
        Security Keys are hardware devices that can be used for two-factor
        authentication. To sign in using a Security Key, you press a button on
        the device, rather than type in a token.
      </div>
      <div>
        Security Keys help protect against phishing, and as a result, they can
        be more secure than token-based two-factor authentication.
      </div>
      <div>
        Aptible supports Security Keys that conform to the{" "}
        <ExternalLink href="https://fidoalliance.org/" variant="info">
          FIDO U2F standard
        </ExternalLink>
        .
      </div>
      <form onSubmit={onSubmit}>
        <FormGroup
          label="Name"
          htmlFor="input-name"
          feedbackVariant={error ? "danger" : "info"}
        >
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="username"
          />
          <div>Pick a name that helps you remember this key</div>
        </FormGroup>
        {error ? <Banner variant="error">{error}</Banner> : null}
        <div>
          <Button type="submit">Register</Button>
        </div>
      </form>
    </div>
  );
};
