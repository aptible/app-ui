import {
  fetchApp,
  fetchService,
  selectEndpointsByServiceId,
  selectServiceById,
  updateServiceById,
} from "@app/deploy";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import { type SyntheticEvent, useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  ButtonLinkDocs,
  CheckBox,
  FormGroup,
  Input,
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

  const action = updateServiceById({ ...nextService });
  const modifyLoader = useLoader(action);
  const cancelChanges = () => setNextService(service);
  const changesExist =
    service.forceZeroDowntime !== nextService.forceZeroDowntime ||
    service.naiveHealthCheck !== nextService.naiveHealthCheck ||
    service.stopTimeout !== nextService.stopTimeout;

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(action);
  };

  return (
    <div className="flex flex-col gap-4">
      <Box>
        <form onSubmit={onSubmitForm}>
          <BannerMessages {...modifyLoader} className="mb-4" />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="text-lg text-gray-500 mb-4">
                Service Deployment Settings
              </h1>
              <ButtonLinkDocs href="https://www.aptible.com/docs/core-concepts/apps/deploying-apps/releases/overview" />
            </div>
            <div className="flex flex-col gap-2">
              {endpoints.length > 0 ? (
                <Banner>
                  Cannot configure zero-downtime or non-endpoint health checks
                  for services with endpoints.
                </Banner>
              ) : null}
              {endpoints.length === 0 && (
                <>
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
                </>
              )}
              <div className="flex flex-col gap-4 items-center mb-4">
                <div className="flex flex-col w-full gap-4">
                  <FormGroup
                    splitWidthInputs
                    description={`The time in seconds to wait for the old release's containers to stop before killing them. Must be between 1 and 900 seconds.`}
                    label="Stop Timeout"
                    htmlFor="stop-timeout"
                    className="mt-4"
                  >
                    <Input
                      id="stop-timeout"
                      type="number"
                      min={0}
                      max={900}
                      value={nextService.stopTimeout ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsedValue =
                          value === "" ? null : Number.parseInt(value);
                        setNextService({
                          ...nextService,
                          stopTimeout:
                            parsedValue === null
                              ? null
                              : Math.min(Math.max(0, parsedValue), 900),
                        });
                      }}
                    />
                  </FormGroup>
                </div>
              </div>
              <div className="flex mt-4">
                <Button
                  name="settings-save"
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
            </div>
          </div>
        </form>
      </Box>
    </div>
  );
};
