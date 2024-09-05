import { prettyDateTime } from "@app/date";
import {
  type ServiceSizingPolicyEditProps,
  cancelServicesOpsPoll,
  containerSizesByProfile,
  fetchApp,
  fetchService,
  fetchServiceSizingPoliciesByServiceId,
  getContainerProfileFromType,
  modifyServiceSizingPolicy,
  pollServiceOperations,
  scaleService,
  selectAppById,
  selectContainerProfilesForStack,
  selectEndpointsByServiceId,
  selectEnvironmentById,
  selectPreviousServiceScale,
  selectServiceById,
  selectServiceScale,
  selectServiceSizingPolicyByServiceId,
  selectStackById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { appActivityUrl } from "@app/routes";
import { DEFAULT_INSTANCE_CLASS, schema } from "@app/schema";
import type {
  AutoscalingTypes,
  DeployOperation,
  DeployServiceSizingPolicy,
  InstanceClass,
} from "@app/types";
import { type SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { usePoller, useValidator } from "../hooks";
import {
  Banner,
  ButtonIcon,
  ButtonLinkDocs,
  IconChevronDown,
  IconChevronRight,
  IconRefresh,
  KeyValueGroup,
  ServicePricingCalc,
  tokens,
} from "../shared";
import {
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Input,
  Select,
  type SelectOption,
} from "../shared";

const validators = {
  containerCount: (data: AppScaleProps) => {
    if (data.containerCount > 32) {
      return "Container count cannot exceed 32";
    }
  },
};

const policyValidators = {
  ratios: (data: ServiceSizingPolicyEditProps) => {
    if (
      data.autoscaling === "vertical" &&
      data.memCpuRatioRThreshold < data.memCpuRatioCThreshold
    ) {
      return "Ratio for R must be larger than ratio for C";
    }
  },
  minContainers: (data: ServiceSizingPolicyEditProps) => {
    if (
      data.autoscaling === "horizontal" &&
      data.minContainers &&
      data.maxContainers
    ) {
      if (data.minContainers > data.maxContainers) {
        return "Minimum containers must be less than maximum containers";
      }
    } else if (data.autoscaling === "horizontal" && !data.minContainers) {
      return "Minimum containers is required";
    }
  },
  maxContainers: (data: ServiceSizingPolicyEditProps) => {
    if (data.autoscaling === "horizontal") {
      if (
        data.minContainers &&
        data.maxContainers &&
        data.maxContainers < data.minContainers
      ) {
        return "Maximum containers must be above minimum containers";
      }
      if (!data.maxContainers) {
        return "Maximum containers is required";
      }
    }
  },
};

type AppScaleProps = {
  containerCount: number;
};

const PolicySummary = ({
  policy,
  title,
}: { policy: DeployServiceSizingPolicy; title: string }) => {
  const data = [];
  if (policy.scalingEnabled) {
    switch (policy.autoscaling) {
      case "horizontal":
        data.push(
          {
            key: "Minimum Containers",
            value: policy.minContainers?.toString() || "",
          },
          {
            key: "Maximum Containers",
            value: policy.maxContainers?.toString() || "",
          },
          {
            key: "Scale Down CPU Threshold",
            value: policy.minCpuThreshold?.toString() || "",
          },
          {
            key: "Scale Up CPU Threshold",
            value: policy.maxCpuThreshold?.toString() || "",
          },
        );
        break;
      case "vertical":
        data.push(
          { key: "Minimum Memory", value: policy.minimumMemory.toString() },
          {
            key: "Maximum Memory",
            value: policy.maximumMemory?.toString() || "Not set",
          },
        );
        break;
    }
  }

  let titleAddition = "";
  if (policy.scalingEnabled)
    titleAddition = ` - ${policy.autoscaling} autoscaling`;
  else titleAddition = " - Autoscaling Disabled";

  return (
    <div>
      <h4 className={`${tokens.type.h4} capitalize`}>
        {`${title} Settings${titleAddition}`}
      </h4>
      <KeyValueGroup data={data} variant="horizontal-inline" />
      {policy.scalingEnabled &&
      policy.autoscaling === "horizontal" &&
      (policy.minContainers ?? 0) < 2 ? (
        <Banner className="mt-2" variant="warning">
          Warning: High-availability requires at least 2 containers
        </Banner>
      ) : null}
    </div>
  );
};

type AutoscalingTypeInp = "horizontal" | "vertical" | "disabled";

const AutoscalingSection = ({
  serviceId,
  stackId,
}: { serviceId: string; stackId: string }) => {
  const dispatch = useDispatch();
  useQuery(fetchServiceSizingPoliciesByServiceId({ serviceId }));
  const existingPolicy = useSelector((s) =>
    selectServiceSizingPolicyByServiceId(s, { id: serviceId }),
  );
  const [nextPolicy, setNextPolicy] = useState(existingPolicy);
  useEffect(() => {
    setNextPolicy(existingPolicy);
  }, [existingPolicy.id]);
  const [autoscalingType, setAutoscalingType] =
    useState<AutoscalingTypeInp>("disabled");
  useEffect(() => {
    if (existingPolicy.scalingEnabled)
      setAutoscalingType(existingPolicy.autoscaling);
    else setAutoscalingType("disabled");
  }, [existingPolicy.autoscaling, existingPolicy.scalingEnabled]);
  const getChangesExist = () => {
    if (!nextPolicy.scalingEnabled && !existingPolicy.scalingEnabled) {
      return false;
    }
    return existingPolicy !== nextPolicy;
  };
  const changesExist = getChangesExist();

  const modifyLoader = useLoader(modifyServiceSizingPolicy);
  const stack = useSelector((s) => selectStackById(s, { id: stackId }));

  const [errors, validate] = useValidator<
    ServiceSizingPolicyEditProps,
    typeof policyValidators
  >(policyValidators);
  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!validate(nextPolicy)) return;
    dispatch(modifyServiceSizingPolicy({ ...nextPolicy, serviceId }));
  };
  const updatePolicy = <K extends keyof ServiceSizingPolicyEditProps>(
    key: K,
    value: ServiceSizingPolicyEditProps[K],
  ) => {
    setNextPolicy((lastPolicy) => {
      return { ...lastPolicy, [key]: value };
    });
  };
  const resetAdvancedSettings = () => {
    setNextPolicy({
      ...schema.serviceSizingPolicies.empty,
      id: nextPolicy.id,
      scalingEnabled: nextPolicy.scalingEnabled,
      autoscaling: nextPolicy.autoscaling,
    });
  };

  const [advancedIsOpen, setOpen] = useState(false);

  const options: SelectOption[] = [
    {
      label: "Disabled: No autoscaling",
      value: "disabled",
    },
    {
      label: "Enabled: Horizontal Autoscaling",
      value: "horizontal",
    },
  ];

  if (stack.verticalAutoscaling) {
    options.push({
      label: "Enabled: Vertical Autoscaling",
      value: "vertical",
    });
  }

  const autoscalingDescriptions = {
    horizontal:
      "Automatically scale your services by regularly reviewing recent CPU utilization and scale to the optimal container count.",
    vertical:
      "Automatically scale your services by regularly reviewing recent CPU and RAM utilization and scale to the optimal configuration.",
  };

  const setAutoscaling = (opt: SelectOption<AutoscalingTypeInp>) => {
    setOpen(false);

    if (opt.value === "disabled") {
      updatePolicy("scalingEnabled", false);
      setAutoscalingType("disabled");
      return;
    }

    updatePolicy("scalingEnabled", true);
    updatePolicy("autoscaling", opt.value as AutoscalingTypes);
    setAutoscalingType(opt.value as AutoscalingTypes);

    if (opt.value === "horizontal") setOpen(true);
  };

  return (
    <Box>
      <form onSubmit={onSubmitForm}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <h1 className="text-lg text-gray-500">Autoscale</h1>
            <ButtonLinkDocs href="https://aptible.notion.site/Vertical-Autoscaler-d33817b4e1584e2e8a8a86edc507756a" />
          </div>
          <BannerMessages {...modifyLoader} />
          <div className="flex gap-4">
            <FormGroup
              label="Autoscaling"
              htmlFor="autoscaling"
              className="w-1/2"
            >
              <Select
                ariaLabel="Autoscaling Setting"
                id="autoscaling"
                options={options}
                onSelect={setAutoscaling}
                value={autoscalingType}
              />
              <p className="mt-2 text-gray-500">
                {nextPolicy.scalingEnabled
                  ? autoscalingDescriptions[nextPolicy.autoscaling]
                  : ""}
              </p>
            </FormGroup>
            <div className="w-1/2 pb-4">
              <PolicySummary policy={existingPolicy} title="Current" />
            </div>
          </div>
          <div>
            {autoscalingType !== "disabled" ? (
              <div className="pb-4 flex justify-between items-center">
                <div className="flex flex-1">
                  <div
                    className="font-semibold flex items-center cursor-pointer"
                    onClick={() => setOpen(!advancedIsOpen)}
                    onKeyUp={() => setOpen(!advancedIsOpen)}
                  >
                    {advancedIsOpen ? (
                      <IconChevronDown />
                    ) : (
                      <IconChevronRight />
                    )}
                    <p>{advancedIsOpen ? "Hide" : "Show"} Advanced Settings</p>
                  </div>
                </div>
              </div>
            ) : null}
            {advancedIsOpen ? (
              <div className="pb-4">
                <div className="flex flex-col gap-2">
                  {nextPolicy.autoscaling === "vertical" ? (
                    <div className="flex flex-col gap-2">
                      <h2 className="text-md text-gray-500">
                        RAM & CPU Threshold Settings
                      </h2>
                      <FormGroup
                        splitWidthInputs
                        description="Percentile to use for RAM and CPU"
                        label="Percentile"
                        htmlFor="percentile"
                      >
                        <Input
                          id="percentile"
                          name="percentile"
                          type="number"
                          step="0.1"
                          value={nextPolicy.percentile}
                          min="0"
                          max="100"
                          placeholder="0 (Min), 100 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "percentile",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(1),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="The minimum memory that vertical autoscaling can scale this service to"
                        label="Minimum Memory (MB)"
                        htmlFor="minimum-memory"
                      >
                        <Input
                          id="minimum-memory"
                          name="minimum-memory"
                          type="number"
                          value={nextPolicy.minimumMemory}
                          min="512"
                          max="784384"
                          placeholder="512 (Min), 784384 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "minimumMemory",
                              Number.parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="The maximum memory that vertical autoscaling can scale this service to"
                        label="Maximum Memory (MB)"
                        htmlFor="maximum-memory"
                      >
                        <Input
                          id="maximum-memory"
                          name="maximum-memory"
                          type="number"
                          value={nextPolicy.maximumMemory || ""}
                          min="512"
                          max="784384"
                          placeholder="512 (Min), 784384 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "maximumMemory",
                              Number.parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="Percent of the current memory limit for a container that will trigger a scale up"
                        label="Memory Scale Up Percentage"
                        htmlFor="memory-scale-up"
                      >
                        <Input
                          id="memory-scale-up"
                          name="memory-scale-up"
                          type="number"
                          step="0.01"
                          value={nextPolicy.memScaleUpThreshold}
                          min="0"
                          max="1"
                          placeholder="0 (Min), 1 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "memScaleUpThreshold",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(2),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="Percent of the next smallest memory limit for a container that will trigger a scale down"
                        label="Memory Scale Down Percentage"
                        htmlFor="memory-scale-down"
                      >
                        <Input
                          id="memory-scale-down"
                          name="memory-scale-down"
                          type="number"
                          step="0.01"
                          value={nextPolicy.memScaleDownThreshold}
                          min="0"
                          max="1"
                          placeholder="0 (Min), 1 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "memScaleDownThreshold",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(2),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        feedbackMessage={errors.ratios}
                        feedbackVariant={errors.ratios ? "danger" : "info"}
                        description="Threshold of the Memory (in GB) to CPU (in CPUs) ratio in which values above will move into R profile"
                        label="Memory Optimized Memory/CPU Ratio Threshold"
                        htmlFor="r-ratio"
                      >
                        <Input
                          id="r-ratio"
                          name="r-ratio"
                          type="number"
                          step="0.1"
                          value={nextPolicy.memCpuRatioRThreshold}
                          min="0"
                          max="16"
                          placeholder="0 (Min), 16 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "memCpuRatioRThreshold",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(1),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="Threshold of the Memory (in GB) to CPU (in CPUs) ratio in which values below will move into C profile"
                        label="Compute Optimized Memory/CPU Ratio Threshold"
                        htmlFor="c-ratio"
                      >
                        <Input
                          id="c-ratio"
                          name="c-ratio"
                          type="number"
                          step="0.01"
                          value={nextPolicy.memCpuRatioCThreshold}
                          min="0"
                          max="8"
                          placeholder="0 (Min), 8 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "memCpuRatioCThreshold",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(2),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <h2 className="text-md text-gray-500">
                        Container & CPU Threshold Settings
                      </h2>
                      <FormGroup
                        splitWidthInputs
                        description="Containers are scaled one at a time sequentially"
                        feedbackMessage={
                          errors.minContainers ||
                          ((nextPolicy.minContainers ?? 0) < 2
                            ? "Warning: High-availability requires at least 2 containers"
                            : "")
                        }
                        feedbackVariant={
                          errors.minContainers ? "danger" : "warn"
                        }
                        label="Minimum Container Count"
                        htmlFor="min-containers"
                      >
                        <Input
                          id="min-containers"
                          name="min-containers"
                          type="number"
                          value={nextPolicy.minContainers || "2"}
                          min="0"
                          max="9999"
                          placeholder=""
                          onChange={(e) =>
                            updatePolicy(
                              "minContainers",
                              Number.parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="Containers are scaled one at a time sequentially"
                        feedbackMessage={errors.maxContainers}
                        feedbackVariant="danger"
                        label="Maximum Container Count"
                        htmlFor="max-containers"
                      >
                        <Input
                          id="max-containers"
                          name="max-containers"
                          type="number"
                          value={nextPolicy.maxContainers || "4"}
                          min="0"
                          max="9999"
                          placeholder=""
                          onChange={(e) =>
                            updatePolicy(
                              "maxContainers",
                              Number.parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="Percent of CPU usage that will trigger a scale down"
                        label="Scale Down Threshold (CPU Usage)"
                        htmlFor="cpu-scale-down"
                      >
                        <Input
                          id="cpu-scale-down"
                          name="cpu-scale-down"
                          type="number"
                          step="0.01"
                          value={nextPolicy.minCpuThreshold || "0.1"}
                          min="0"
                          max="1"
                          placeholder="0 (Min), 1 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "minCpuThreshold",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(2),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="Percent of CPU usage that will trigger a scale up"
                        label="Scale Up Threshold (CPU Usage)"
                        htmlFor="cpu-scale-up"
                      >
                        <Input
                          id="cpu-scale-up"
                          name="cpu-scale-up"
                          type="number"
                          step="0.01"
                          value={nextPolicy.maxCpuThreshold || "0.9"}
                          min="0"
                          max="1"
                          placeholder="0 (Min), 1 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "maxCpuThreshold",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(2),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="Percentile to use for CPU"
                        label="Percentile"
                        htmlFor="percentile"
                      >
                        <Input
                          id="percentile"
                          name="percentile"
                          type="number"
                          step="0.1"
                          value={nextPolicy.percentile}
                          min="0"
                          max="100"
                          placeholder="0 (Min), 100 (Max)"
                          onChange={(e) =>
                            updatePolicy(
                              "percentile",
                              Number(
                                Number.parseFloat(
                                  e.currentTarget.value,
                                ).toFixed(1),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                    </div>
                  )}
                  <h2 className="text-md text-gray-500">Time-Based Settings</h2>
                  <FormGroup
                    splitWidthInputs
                    description="Time interval in seconds to fetch metrics for evaluation"
                    label="Metrics Lookback Time Interval"
                    htmlFor="lookback-interval"
                  >
                    <Input
                      id="lookback-interval"
                      name="lookback-interval"
                      type="number"
                      value={nextPolicy.metricLookbackSeconds}
                      min="0"
                      max="3600"
                      placeholder="0 (Min), 3600 (Max)"
                      onChange={(e) =>
                        updatePolicy(
                          "metricLookbackSeconds",
                          Number.parseInt(e.currentTarget.value, 10),
                        )
                      }
                    />
                  </FormGroup>
                  <FormGroup
                    splitWidthInputs
                    description="The number of seconds to wait after an automated scale to potentially scale up"
                    label="Scale Up Cooldown"
                    htmlFor="scale-up-cooldown"
                  >
                    <Input
                      id="scale-up-cooldown"
                      name="scale-up-cooldown"
                      type="number"
                      value={nextPolicy.postScaleUpCooldownSeconds}
                      min="0"
                      max="3600"
                      placeholder="0 (Min), 3600 (Max)"
                      onChange={(e) =>
                        updatePolicy(
                          "postScaleUpCooldownSeconds",
                          Number.parseInt(e.currentTarget.value, 10),
                        )
                      }
                    />
                  </FormGroup>
                  <FormGroup
                    splitWidthInputs
                    description="The number of seconds to wait after an automated scale to potentially scale down"
                    label="Scale Down Cooldown"
                    htmlFor="scale-down-cooldown"
                  >
                    <Input
                      id="scale-down-cooldown"
                      name="scale-down-cooldown"
                      type="number"
                      value={nextPolicy.postScaleDownCooldownSeconds}
                      min="0"
                      max="3600"
                      placeholder="0 (Min), 3600 (Max)"
                      onChange={(e) =>
                        updatePolicy(
                          "postScaleDownCooldownSeconds",
                          Number.parseInt(e.currentTarget.value, 10),
                        )
                      }
                    />
                  </FormGroup>
                  <FormGroup
                    splitWidthInputs
                    description="The number of seconds to wait after a general scale to potentially take another action"
                    label="Post Release Cooldown"
                    htmlFor="release-cooldown"
                  >
                    <Input
                      id="release-cooldown"
                      name="release-cooldown"
                      type="number"
                      value={nextPolicy.postReleaseCooldownSeconds}
                      min="0"
                      max="3600"
                      placeholder="0 (Min), 3600 (Max)"
                      onChange={(e) =>
                        updatePolicy(
                          "postReleaseCooldownSeconds",
                          Number.parseInt(e.currentTarget.value, 10),
                        )
                      }
                    />
                  </FormGroup>
                  <h2 className="text-md text-gray-500">General Settings</h2>
                  <FormGroup
                    splitWidthInputs
                    label="Reset Advanced Settings to Defaults"
                    description="This will restore settings to their default values."
                    htmlFor="reset-button"
                  >
                    <div id="reset-button">
                      <ButtonIcon
                        icon={<IconRefresh variant="sm" />}
                        variant="white"
                        onClick={resetAdvancedSettings}
                      >
                        Reset to Defaults
                      </ButtonIcon>
                    </div>
                  </FormGroup>
                </div>
              </div>
            ) : null}
          </div>
          <hr />

          <div className="flex">
            <Button
              name="autoscaling"
              className="w-40 flex font-semibold"
              type="submit"
              disabled={!changesExist}
              isLoading={modifyLoader.isLoading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Box>
  );
};

const getScaleText = (op: DeployOperation) =>
  `${op.containerCount} x ${op.containerSize / 1024} GB ${
    getContainerProfileFromType(op.instanceProfile as InstanceClass).name ||
    op.instanceProfile
  } container${op.containerCount === 1 ? "" : "s"}`;

const LastScaleBanner = ({ serviceId }: { serviceId: string }) => {
  const current = useSelector((s) => selectServiceScale(s, { id: serviceId }));
  const prev = useSelector((s) =>
    selectPreviousServiceScale(s, { id: serviceId }),
  );
  const neverScaled = current.status === "unknown";
  const currentComplete = current.status === "succeeded";
  const action = pollServiceOperations({ id: serviceId });
  const loader = useLoader(action);

  const poller = useMemo(() => action, [serviceId]);
  const cancel = useMemo(() => cancelServicesOpsPoll(), []);
  usePoller({ action: poller, cancel });

  if (loader.isInitialLoading) {
    return null;
  }

  return (
    <Banner variant={currentComplete || neverScaled ? "info" : "progress"}>
      {neverScaled ? (
        "Never Scaled"
      ) : (
        <>
          <strong>
            {currentComplete ? "Last Scale" : "Scale in Progress"}:
          </strong>{" "}
          {prettyDateTime(current.createdAt)} from {getScaleText(prev)} to{" "}
          {getScaleText(current)}
        </>
      )}
    </Banner>
  );
};

export const AppDetailServiceScalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "", serviceId = "" } = useParams();
  const [errors, validate] = useValidator<AppScaleProps, typeof validators>(
    validators,
  );
  useQuery(fetchApp({ id }));
  const [containerCount, setContainerCount] = useState(1);
  const [containerProfileType, setContainerProfileType] =
    useState<InstanceClass>(DEFAULT_INSTANCE_CLASS);
  const [containerSize, setContainerSize] = useState<number>(512);
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchService({ id: serviceId }));
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const stack = useSelector((s) =>
    selectStackById(s, { id: environment.stackId }),
  );
  const containerProfilesForStack = useSelector((s) =>
    selectContainerProfilesForStack(s, { id: environment.stackId }),
  );
  const endpoints = useSelector((s) =>
    selectEndpointsByServiceId(s, { serviceId }),
  );

  const action = scaleService({
    id: serviceId,
    containerCount,
    containerSize,
    containerProfile: containerProfileType,
  });
  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!validate({ containerCount })) return;
    dispatch(action);
  };
  const loader = useLoader(scaleService);

  useEffect(() => {
    setContainerCount(service.containerCount);
  }, [service.containerCount]);

  useEffect(() => {
    setContainerProfileType(service.instanceClass);
  }, [service.instanceClass]);

  useEffect(() => {
    if (service.containerMemoryLimitMb) {
      setContainerSize(service.containerMemoryLimitMb);
    }
  }, [service.containerMemoryLimitMb]);

  const changesExist =
    service.containerCount !== containerCount ||
    service.instanceClass !== containerProfileType ||
    service.containerMemoryLimitMb !== containerSize;

  useLoaderSuccess(loader, () => {
    navigate(appActivityUrl(app.id));
  });

  const currentContainerProfile = getContainerProfileFromType(
    service.instanceClass,
  );
  const requestedContainerProfile =
    getContainerProfileFromType(containerProfileType);

  const profileOptions = Object.keys(containerProfilesForStack).map(
    (profileType) => {
      const profile = getContainerProfileFromType(profileType as InstanceClass);
      return {
        label: profile.name,
        value: profileType,
      };
    },
  );

  const memoryContainerOptions = containerSizesByProfile(
    containerProfileType,
  ).map((containerSizeOption) => {
    return {
      label: `${containerSizeOption / 1024} GB`,
      value: `${containerSizeOption}`,
    };
  });

  const changeContainerProfile = (opt: SelectOption) => {
    const instClass = opt.value as InstanceClass;
    const profile = containerProfilesForStack[instClass];
    if (!profile) {
      return;
    }

    if (containerSize < profile.minimumContainerSize) {
      setContainerSize(profile.minimumContainerSize);
    }
    setContainerProfileType(instClass);
  };

  const setContainerScalingValues = () => {
    setContainerProfileType(service.instanceClass);
    setContainerSize(service.containerMemoryLimitMb);
    setContainerCount(service.containerCount);
  };

  return (
    <div className="flex flex-col gap-4">
      <LastScaleBanner serviceId={serviceId} />
      <AutoscalingSection serviceId={serviceId} stackId={stack.id} />
      <Box>
        <form onSubmit={onSubmitForm}>
          <div className="flex flex-col gap-2">
            <h1 className="text-lg text-gray-500 mb-4">Manual Scale</h1>
            <FormGroup
              splitWidthInputs
              description="Optimize container performance with a custom profile."
              label="Container Profile"
              htmlFor="container-profile"
            >
              <Select
                id="container-profile"
                ariaLabel="container-profile"
                disabled={Object.keys(containerProfilesForStack).length <= 1}
                value={containerProfileType}
                onSelect={changeContainerProfile}
                options={profileOptions}
              />
            </FormGroup>
            <FormGroup
              splitWidthInputs
              description={`Horizontally scale this service by increasing the number of containers. A count of 2 or more will provide High Availability. 32 max count for ${
                getContainerProfileFromType(containerProfileType).name
              } profiles.`}
              label="Number of Containers"
              htmlFor="number-containers"
              feedbackMessage={errors.containerCount}
              feedbackVariant={errors.containerCount ? "danger" : "info"}
            >
              <Input
                id="number-containers"
                name="number-containers"
                type="number"
                value={containerCount}
                min="0"
                max="32"
                placeholder="0 (Min), 32 (Max)"
                onChange={(e) =>
                  setContainerCount(
                    Number.parseInt(e.currentTarget.value || "0", 10),
                  )
                }
              />
            </FormGroup>
            <FormGroup
              splitWidthInputs
              description="Specify the memory you wish to allow per container."
              label="Memory per Container"
              htmlFor="memory-container"
            >
              <Select
                id="memory-container"
                value={containerSize.toString()}
                onSelect={(opt) => setContainerSize(Number.parseInt(opt.value))}
                options={memoryContainerOptions}
              />
            </FormGroup>
            <FormGroup
              splitWidthInputs
              description="CPU Share is determined by the selected Memory Limit and Container Profile."
              label="CPU Share per Container"
              htmlFor="cpu-share"
            >
              <Input
                id="number-containers"
                name="number-containers"
                className="disabled"
                type="text"
                disabled
                value={requestedContainerProfile.cpuShare * containerSize}
              />
            </FormGroup>
          </div>

          <ServicePricingCalc service={service} endpoints={endpoints} />

          <hr />

          {changesExist ? (
            <div className="text-md font-semibold text-gray-900 mt-4">
              Pending Changes
            </div>
          ) : null}
          {containerProfileType !== service.instanceClass ? (
            <div className="my-3">
              <div className="text-md text-gray-900">Container Profile</div>
              <p className="text-black-500">
                Changed from {currentContainerProfile.name} to{" "}
                {requestedContainerProfile.name}
              </p>
            </div>
          ) : null}
          {containerCount !== service.containerCount ? (
            <div className="my-3">
              <div className="text-md text-gray-900">Container Count</div>
              <p className="text-black-500">
                Changed from {service.containerCount} to {containerCount}
              </p>
            </div>
          ) : null}
          {containerSize !== service.containerMemoryLimitMb ? (
            <div className="my-3">
              <div className="text-md text-gray-900">Container Size</div>
              <p className="text-black-500" id="container-size-txt">
                Changed from {service.containerMemoryLimitMb / 1024} GB to{" "}
                {containerSize / 1024} GB
              </p>
            </div>
          ) : null}
          {changesExist ? (
            <ServicePricingCalc
              service={{
                containerCount,
                containerMemoryLimitMb: containerSize,
                instanceClass: containerProfileType,
              }}
              endpoints={endpoints}
            />
          ) : null}

          <BannerMessages {...loader} />

          <div className="flex mt-4">
            <Button
              className="w-40 flex font-semibold"
              type="submit"
              disabled={!changesExist}
            >
              Save Changes
            </Button>

            {changesExist ? (
              <Button
                className="w-40 ml-2 flex font-semibold"
                onClick={setContainerScalingValues}
                variant="white"
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Box>
    </div>
  );
};
