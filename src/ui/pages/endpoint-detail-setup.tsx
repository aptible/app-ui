import { checkDns, renewEndpoint, selectEndpointById } from "@app/deploy";
import { useDispatch, useSelector } from "@app/react";
import { useLoader, useLoaderSuccess, useQuery } from "@app/react";
import { endpointDetailActivityUrl } from "@app/routes";
import type { AcmeChallenge } from "@app/types";
import { useNavigate, useParams } from "react-router";
import {
  Box,
  Button,
  CopyText,
  Group,
  IconCheck,
  IconX,
  Tooltip,
  tokens,
} from "../shared";

const CnameItem = ({ from, to }: { from: string; to: string }) => {
  const loader = useQuery(checkDns({ from, to }));
  const onCheck = () => {
    loader.trigger();
  };

  return (
    <div className="flex justify-between items-center gap-2 border p-4 rounded-lg">
      <Group size="sm">
        <div className="font-semibold">CNAME</div>
        <Group variant="horizontal" size="sm">
          <div className="w-[50px] font-bold">From</div>
          <CopyText text={from} />
        </Group>
        <Group variant="horizontal" size="sm">
          <div className="w-[50px] font-bold">To</div>
          <CopyText text={to} />
        </Group>
      </Group>
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
        <Button onClick={onCheck} isLoading={loader.isLoading}>
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
  const enp = useSelector((s) => selectEndpointById(s, { id }));
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
