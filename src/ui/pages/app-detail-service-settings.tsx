import {
  fetchApp,
  fetchService,
  getEndpointUrl,
  modifyService,
  selectEndpointsByServiceId,
  selectServiceById,
} from "@app/deploy";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import { endpointDetailUrl } from "@app/routes";
import { type SyntheticEvent, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  ButtonLinkDocs,
  CheckBox,
  Tooltip,
} from "../shared";

export const AppDetailServiceSettingsPage = () => {
  const dispatch = useDispatch();
  const { id = "", serviceId = "" } = useParams();
  useQuery(fetchApp({ id }));
  useQuery(fetchService({ id: serviceId }));
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));
  const endpoints = useSelector((s) =>
    selectEndpointsByServiceId(s, { serviceId: service.id }),
  );

  const [nextService, setNextService] = useState(service);
  useEffect(() => {
    setNextService(service);
  }, [service.id]);

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(modifyService({ ...nextService }));
  };

  const getChangesExist = () => {
    return service !== nextService;
  };
  const changesExist = getChangesExist();

  const modifyLoader = useLoader(modifyService);

  const cancelChanges = () => setNextService(service);

  return (
    <div className="flex flex-col gap-4">
      <Box>
        <form onSubmit={onSubmitForm}>
          <BannerMessages {...modifyLoader} />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="text-lg text-gray-500 mb-4">Service Settings</h1>
              <ButtonLinkDocs href="https://www.aptible.com/docs/core-concepts/apps/deploying-apps/releases/overview" />
            </div>
            {endpoints.length > 0 ? (
              <Banner>
                Service settings are managed through the following Endpoints:
                {endpoints.map((endpoint, index) => {
                  return (
                    <span key={index}>
                      {index === 0 && " "}
                      <Link to={endpointDetailUrl(endpoint.id)}>
                        {getEndpointUrl(endpoint)}
                      </Link>
                      {index < endpoints.length - 1 && ", "}
                    </span>
                  );
                })}
              </Banner>
            ) : (
              <>
                <h2 className="text-md font-semibold">Deployment Strategy</h2>
                <CheckBox
                  name="zero-downtime"
                  label="Enable Zero-Downtime Deployment"
                  checked={nextService.forceZeroDowntime}
                  onChange={(e) =>
                    setNextService({
                      ...nextService,
                      forceZeroDowntime: e.currentTarget.checked,
                    })
                  }
                />
                <div className="flex gap-2">
                  <Tooltip text="When enabled, ignores Docker healthchecks and instead only waits to ensure the container stays up for at least 30 seconds.">
                    <CheckBox
                      name="simple-healthcheck"
                      label="Use simple healthcheck (30s)"
                      checked={nextService.naiveHealthCheck}
                      onChange={(e) =>
                        setNextService({
                          ...nextService,
                          naiveHealthCheck: e.currentTarget.checked,
                        })
                      }
                    />
                  </Tooltip>
                </div>
                <div className="flex mt-4">
                  <Button
                    name="autoscaling"
                    className="w-40 flex font-semibold"
                    type="submit"
                    disabled={!changesExist}
                    isLoading={modifyLoader.isLoading}
                  >
                    Save Changes
                  </Button>
                  {changesExist ? (
                    <Button
                      className="w-40 ml-2 flex font-semibold"
                      onClick={cancelChanges}
                      variant="white"
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </form>
      </Box>
    </div>
  );
};
