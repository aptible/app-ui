import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useLoader, useLoaderSuccess, useQuery } from "saga-query/react";

import { checkDns, renewEndpoint, selectEndpointById } from "@app/deploy";
import { endpointDetailActivityUrl } from "@app/routes";
import { AcmeChallenge, AppState } from "@app/types";

import { Button, IconCheck, IconX, Tooltip, tokens } from "../shared";

const CnameItem = ({ from, to }: { from: string; to: string }) => {
  const loader = useQuery(checkDns({ from, to }));
  const onCheck = () => {
    loader.trigger();
  };

  return (
    <div className="flex justify-between items-center gap-2 border rounded p-2">
      <div>
        <span className="font-semibold">CNAME</span> from{" "}
        <span className="font-semibold">{from}</span> to{" "}
        <span className="font-semibold">{to}</span>
      </div>
      <div className="flex items-center gap-2">
        <div>
          {loader.meta.success ? (
            <Tooltip text="DNS check succeeded">
              <IconCheck color="#00633F" />
            </Tooltip>
          ) : (
            <Tooltip text="DNS check failed">
              <IconX color="#AD1A1A" />
            </Tooltip>
          )}
        </div>
        <Button onClick={onCheck} size="xs" isLoading={loader.isLoading}>
          Check
        </Button>
      </div>
    </div>
  );
};

const ChallengeItem = ({ challenge }: { challenge: AcmeChallenge }) => {
  return (
    <div>
      {challenge.to.map((to) => {
        if (to.legacy) {
          return null;
        }

        return (
          <CnameItem
            key={`${challenge.from.name}-${to.name}`}
            from={challenge.from.name}
            to={to.name}
          />
        );
      })}
    </div>
  );
};

export const EndpointDetailSetupPage = () => {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const enp = useSelector((s: AppState) => selectEndpointById(s, { id }));
  const challenges = enp.acmeConfiguration?.challenges || [];
  const action = renewEndpoint({ id });
  const renew = () => {
    dispatch(action);
  };
  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
    navigate(endpointDetailActivityUrl(enp.id));
  });

  return (
    <Box>
      <div className="flex flex-col gap-2">
        <h3 className={tokens.type.h3}>Managed HTTPS Validation Records</h3>

        <div>
          First, create the following CNAME records via the DNS provider you use
          for <strong>{enp.userDomain}</strong>.
        </div>

        <div className="flex flex-col gap-4">
          {challenges.map((challenge) => (
            <ChallengeItem key={challenge.from.name} challenge={challenge} />
          ))}
        </div>

        <div>
          Once you've done so, click the "I created the records" button, and
          Aptible will attempt to generate a new SSL certificate for your
          domain.
        </div>

        <div>
          {enp.acmeStatus === "pending" ? (
            <p>
              Note: you have not provided a transitional certificate. Your app
              will be temporarily unavailable once you switch over DNS.
            </p>
          ) : null}

          {enp.acmeStatus === "transitioning" ? (
            <p>
              Note: you have provided a transitional certificate. Your app will
              be available once you switch over DNS, and Managed HTTPS setup
              will happen in the background.
            </p>
          ) : null}
        </div>

        <Button
          className="w-[200px]"
          isLoading={loader.isLoading}
          onClick={renew}
        >
          I created the records
        </Button>
      </div>
    </Box>
  );
};
