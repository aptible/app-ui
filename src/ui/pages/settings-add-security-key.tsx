import { createWebauthnDevice, webauthnCreate } from "@app/auth";
import { fetchU2fChallenges } from "@app/mfa";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { securitySettingsUrl } from "@app/routes";
import { selectCurrentUserId } from "@app/users";
import { PublicKeyCredentialCreationOptionsJSON } from "node_modules/@github/webauthn-json/dist/types/basic/json";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Banner,
  Box,
  Breadcrumbs,
  Button,
  FormGroup,
  Group,
  Input,
} from "../shared";

interface U2fChallenge {
  id: string;
  challenge: string;
  payload: PublicKeyCredentialCreationOptionsJSON;
}

export const AddSecurityKeyPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const userId = useSelector(selectCurrentUserId);
  const challenge = useCache<U2fChallenge>(fetchU2fChallenges({ userId }));
  const dispatch = useDispatch();
  const loader = useLoader(createWebauthnDevice);
  const [loading, setLoading] = useState(false);

  const createKey = () => {
    setLoading(true);
    if (challenge.isError) {
      setError(challenge.message);
      return;
    }

    if (!challenge.data) {
      setError("Could not load u2f challenge");
      return;
    }

    webauthnCreate({ publicKey: challenge.data.payload })
      .then((u2f) => {
        dispatch(createWebauthnDevice({ userId, name, u2f }));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name) {
      setError("Name must not be blank");
      return;
    }

    setError("");
    createKey();
  };

  useLoaderSuccess(loader, () => {
    navigate(securitySettingsUrl());
  });

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          { name: "Security Settings", to: securitySettingsUrl() },
          { name: "Security Keys", to: null },
        ]}
      />
      <Box>
        <div className="flex flex-col gap-4 justify-center">
          <div>
            Security Keys are hardware devices that can be used for two-factor
            authentication. To sign in using a Security Key, you press a button
            on the device, rather than type in a token.
          </div>
          <div>
            Security Keys help protect against phishing, and as a result, they
            can be more secure than token-based two-factor authentication.
          </div>

          <form onSubmit={onSubmit}>
            <Group>
              <FormGroup
                label="Name"
                htmlFor="input-name"
                feedbackVariant={error ? "danger" : "info"}
              >
                <Input
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  autoComplete="username"
                />
                <div className="text-gray-500">
                  Pick a name that helps you remember this key
                </div>
              </FormGroup>

              {error ? <Banner variant="error">{error}</Banner> : null}

              {loader.isError ? (
                <Banner variant="error">{loader.message}</Banner>
              ) : null}

              <div>
                <Button
                  type="submit"
                  isLoading={loader.isLoading || loading}
                  disabled={name === ""}
                >
                  Save Key
                </Button>
              </div>
            </Group>
          </form>
        </div>
      </Box>
    </Group>
  );
};
