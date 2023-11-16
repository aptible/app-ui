import {
  DEFAULT_INSTANCE_CLASS,
  ServiceSizingPolicyEditProps,
  ServiceSizingPolicyResponse,
  createServiceSizingPoliciesByServiceId,
  deleteServiceSizingPoliciesByServiceId,
  exponentialContainerSizesByProfile,
  fetchApp,
  fetchService,
  fetchServiceSizingPoliciesByServiceId,
  getContainerProfileFromType,
  hourlyAndMonthlyCostsForContainers,
  scaleService,
  selectAppById,
  selectContainerProfilesForStack,
  selectEnvironmentById,
  selectServiceById,
  selectStackById,
  updateServiceSizingPoliciesByServiceId,
} from "@app/deploy";
import { useCache, useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { appActivityUrl } from "@app/routes";
import { AppState, HalEmbedded, InstanceClass } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useValidator } from "../hooks";
import {
  IconChevronDown,
  IconChevronRight,
  Radio,
  RadioGroup,
} from "../shared";
import {
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Input,
  Label,
  Select,
  SelectOption,
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
      data.rRatioLimit !== undefined &&
      data.cRatioLimit !== undefined &&
      data.rRatioLimit < data.cRatioLimit
    ) {
      return "Ratio for R must be larger than ratio for C";
    }
  },
};

type AppScaleProps = {
  containerCount: number;
};

const VerticalAutoscalingSection = ({
  id,
  stackId,
}: { id: string; stackId: string }) => {
  const policy = useCache<
    HalEmbedded<{
      service_sizing_policies: ServiceSizingPolicyResponse[];
    }>
  >(fetchServiceSizingPoliciesByServiceId({ id }));
  const dispatch = useDispatch();

  const existingPolicy =
    policy.data !== null &&
    policy.data._embedded !== undefined &&
    policy.data._embedded.service_sizing_policies.length > 0
      ? policy.data._embedded.service_sizing_policies[0]
      : null;

  const [minimumMemory, setMinimumMemory] = useState<number>(
    existingPolicy?.minimum_memory || 2048,
  );
  const [maximumMemory, setMaximumMemory] = useState<number | undefined>(
    existingPolicy?.maximum_memory,
  );
  const [memoryScaleUp, setMemoryScaleUp] = useState<number>(
    existingPolicy?.mem_scale_up_threshold || 0.9,
  );
  const [memoryScaleDown, setMemoryScaleDown] = useState<number>(
    existingPolicy?.mem_scale_down_threshold || 0.75,
  );
  const [percentile, setPercentile] = useState<number>(
    existingPolicy?.percentile || 99.0,
  );
  const [lookbackInterval, setLookbackInterval] = useState<number>(
    existingPolicy?.metric_lookback_seconds || 1800,
  );
  const [scaleUpCooldown, setScaleUpCooldown] = useState<number>(
    existingPolicy?.post_scale_up_cooldown_seconds || 60,
  );
  const [scaleDownCooldown, setScaleDownCooldown] = useState<number>(
    existingPolicy?.post_scale_down_cooldown_seconds || 300,
  );
  const [releaseCooldown, setReleaseCooldown] = useState<number>(
    existingPolicy?.post_release_cooldown_seconds || 300,
  );
  const [rRatioLimit, setRRatioLimit] = useState<number>(
    existingPolicy?.mem_cpu_ratio_r_threshold || 4.0,
  );
  const [cRatioLimit, setCRatioLimit] = useState<number>(
    existingPolicy?.mem_cpu_ratio_c_threshold || 2.0,
  );

  const isScaling: boolean =
    policy.data?._embedded?.service_sizing_policies !== undefined &&
    policy.data._embedded.service_sizing_policies.length > 0 &&
    policy.data._embedded.service_sizing_policies[0].scaling_enabled;
  const createLoader = useLoader(createServiceSizingPoliciesByServiceId);
  const updateLoader = useLoader(updateServiceSizingPoliciesByServiceId);
  const deleteLoader = useLoader(deleteServiceSizingPoliciesByServiceId);
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: stackId }),
  );
  useLoaderSuccess(createLoader, () => policy.trigger());
  useLoaderSuccess(updateLoader, () => policy.trigger());
  useLoaderSuccess(deleteLoader, () => policy.trigger());
  const [enabled, setEnabled] = useState<"enabled" | "disabled">(
    isScaling ? "enabled" : "disabled",
  );
  useEffect(() => {
    setEnabled(isScaling ? "enabled" : "disabled");
  }, [isScaling]);
  useEffect(() => {
    setMinimumMemory(existingPolicy?.minimum_memory || 2048);
  }, [existingPolicy?.minimum_memory]);
  useEffect(() => {
    setMaximumMemory(existingPolicy?.maximum_memory);
  }, [existingPolicy?.maximum_memory]);
  useEffect(() => {
    setMemoryScaleUp(existingPolicy?.mem_scale_up_threshold || 0.9);
  }, [existingPolicy?.mem_scale_up_threshold]);
  useEffect(() => {
    setMemoryScaleDown(existingPolicy?.mem_scale_down_threshold || 0.75);
  }, [existingPolicy?.mem_scale_down_threshold]);
  useEffect(() => {
    setPercentile(existingPolicy?.percentile || 99.0);
  }, [existingPolicy?.percentile]);
  useEffect(() => {
    setLookbackInterval(existingPolicy?.metric_lookback_seconds || 1800);
  }, [existingPolicy?.metric_lookback_seconds]);
  useEffect(() => {
    setScaleUpCooldown(existingPolicy?.post_scale_up_cooldown_seconds || 60);
  }, [existingPolicy?.post_scale_up_cooldown_seconds]);
  useEffect(() => {
    setScaleDownCooldown(
      existingPolicy?.post_scale_down_cooldown_seconds || 300,
    );
  }, [existingPolicy?.post_scale_down_cooldown_seconds]);
  useEffect(() => {
    setReleaseCooldown(existingPolicy?.post_release_cooldown_seconds || 300);
  }, [existingPolicy?.post_release_cooldown_seconds]);
  useEffect(() => {
    setRRatioLimit(existingPolicy?.mem_cpu_ratio_r_threshold || 4.0);
  }, [existingPolicy?.mem_cpu_ratio_r_threshold]);
  useEffect(() => {
    setCRatioLimit(existingPolicy?.mem_cpu_ratio_c_threshold || 2.0);
  }, [existingPolicy?.mem_cpu_ratio_c_threshold]);

  const policyFormData: ServiceSizingPolicyEditProps = {
    id,
    minimumMemory,
    maximumMemory,
    memoryScaleUp,
    memoryScaleDown,
    percentile,
    lookbackInterval,
    scaleUpCooldown,
    scaleDownCooldown,
    releaseCooldown,
    rRatioLimit,
    cRatioLimit,
  };
  const [errors, validate] = useValidator<
    ServiceSizingPolicyEditProps,
    typeof policyValidators
  >(policyValidators);
  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!validate(policyFormData)) {
      return;
    }
    if (enabled === "enabled") {
      if (existingPolicy === null) {
        dispatch(createServiceSizingPoliciesByServiceId(policyFormData));
      } else {
        dispatch(updateServiceSizingPoliciesByServiceId(policyFormData));
      }
    } else {
      dispatch(deleteServiceSizingPoliciesByServiceId({ id }));
    }
  };

  const changesExist =
    enabled === "disabled"
      ? isScaling
      : (isScaling && enabled !== "enabled") ||
        rRatioLimit !== existingPolicy?.mem_cpu_ratio_r_threshold ||
        cRatioLimit !== existingPolicy?.mem_cpu_ratio_c_threshold ||
        percentile !== existingPolicy?.percentile ||
        minimumMemory !== existingPolicy?.minimum_memory ||
        maximumMemory !== existingPolicy?.maximum_memory ||
        memoryScaleUp !== existingPolicy?.mem_scale_up_threshold ||
        memoryScaleDown !== existingPolicy?.mem_scale_down_threshold ||
        lookbackInterval !== existingPolicy?.metric_lookback_seconds ||
        scaleUpCooldown !== existingPolicy?.post_scale_up_cooldown_seconds ||
        scaleDownCooldown !==
          existingPolicy?.post_scale_down_cooldown_seconds ||
        releaseCooldown !== existingPolicy?.post_release_cooldown_seconds;

  const [advancedIsOpen, setOpen] = useState(false);

  return (
    <>
      {stack.verticalAutoscaling ? (
        <Box>
          <form onSubmit={onSubmitForm}>
            <div className="flex flex-col gap-4">
              <h1 className="text-lg text-gray-500">Autoscale</h1>
              <BannerMessages {...createLoader} />
              <BannerMessages {...deleteLoader} />
              <BannerMessages {...updateLoader} />
              <FormGroup
                splitWidthInputs
                description="Automatically scale your services by regularly revieweing recent CPU and RAM utilization and scaling to the optimal configuration."
                label="Vertical Autoscaling"
                htmlFor="vertical-autoscaling"
              >
                <RadioGroup
                  name="vertical-autoscaling"
                  selected={enabled}
                  onSelect={(e) => {
                    setEnabled(e);
                    if (e === "disabled") {
                      setOpen(false);
                    }
                  }}
                >
                  <Radio value="enabled">Enabled</Radio>
                  <Radio value="disabled">Disabled</Radio>
                </RadioGroup>
              </FormGroup>
              <div>
                <div className="py-4 flex justify-between items-center">
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
                      <p className="ml-2">
                        {advancedIsOpen ? "Hide" : "Show"} Advanced settings
                      </p>
                    </div>
                  </div>
                </div>
                {advancedIsOpen ? (
                  <div className="pb-4">
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
                          value={percentile}
                          min="0"
                          max="100"
                          onChange={(e) =>
                            setPercentile(
                              Number(
                                parseFloat(e.currentTarget.value).toFixed(1),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="The minimum memory that vertical autoscaling can scale this service to"
                        label="Minimum memory"
                        htmlFor="minimum-memory"
                      >
                        <Input
                          id="minimum-memory"
                          name="minimum-memory"
                          type="number"
                          value={minimumMemory}
                          min="0"
                          max="784384"
                          onChange={(e) =>
                            setMinimumMemory(
                              parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="The maximum memory that vertical autoscaling can scale this service to"
                        label="Maximum memory"
                        htmlFor="maximum-memory"
                      >
                        <Input
                          id="maximum-memory"
                          name="maximum-memory"
                          type="number"
                          value={maximumMemory}
                          min="0"
                          max="784384"
                          onChange={(e) =>
                            setMaximumMemory(
                              parseInt(e.currentTarget.value, 10),
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
                          value={memoryScaleUp}
                          min="0"
                          max="1"
                          onChange={(e) =>
                            setMemoryScaleUp(
                              Number(
                                parseFloat(e.currentTarget.value).toFixed(2),
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
                          value={memoryScaleDown}
                          min="0"
                          max="1"
                          onChange={(e) =>
                            setMemoryScaleDown(
                              Number(
                                parseFloat(e.currentTarget.value).toFixed(2),
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
                          value={rRatioLimit}
                          min="0"
                          max="16"
                          onChange={(e) =>
                            setRRatioLimit(
                              Number(
                                parseFloat(e.currentTarget.value).toFixed(1),
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
                          value={cRatioLimit}
                          min="0"
                          max="8"
                          onChange={(e) =>
                            setCRatioLimit(
                              Number(
                                parseFloat(e.currentTarget.value).toFixed(2),
                              ),
                            )
                          }
                        />
                      </FormGroup>
                      <h2 className="text-md text-gray-500">
                        Time-based settings
                      </h2>
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
                          value={lookbackInterval}
                          min="0"
                          max="3600"
                          onChange={(e) =>
                            setLookbackInterval(
                              parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="The number of seconds to wait after an automated scale up to potentially take another action"
                        label="Post Scale Up Cooldown"
                        htmlFor="scale-up-cooldown"
                      >
                        <Input
                          id="scale-up-cooldown"
                          name="scale-up-cooldown"
                          type="number"
                          value={scaleUpCooldown}
                          min="0"
                          max="3600"
                          onChange={(e) =>
                            setScaleUpCooldown(
                              parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                      <FormGroup
                        splitWidthInputs
                        description="The number of seconds to wait after an automated scale down to potentially take another action"
                        label="Post Scale Down Cooldown"
                        htmlFor="scale-down-cooldown"
                      >
                        <Input
                          id="scale-down-cooldown"
                          name="scale-down-cooldown"
                          type="number"
                          value={scaleDownCooldown}
                          min="0"
                          max="3600"
                          onChange={(e) =>
                            setScaleDownCooldown(
                              parseInt(e.currentTarget.value, 10),
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
                          value={releaseCooldown}
                          min="0"
                          max="3600"
                          onChange={(e) =>
                            setReleaseCooldown(
                              parseInt(e.currentTarget.value, 10),
                            )
                          }
                        />
                      </FormGroup>
                    </div>
                  </div>
                ) : null}
              </div>
              <hr />

              <div className="flex mt-4">
                <Button
                  name="autoscaling"
                  className="w-40 flex font-semibold"
                  type="submit"
                  disabled={!changesExist}
                  isLoading={
                    createLoader.isLoading ||
                    updateLoader.isLoading ||
                    deleteLoader.isLoading
                  }
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Box>
      ) : null}
    </>
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
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  useQuery(fetchService({ id: serviceId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );
  const containerProfilesForStack = useSelector((s: AppState) =>
    selectContainerProfilesForStack(s, { id: environment.stackId }),
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
  const loader = useLoader(action);

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
  const { pricePerHour: currentPricePerHour, pricePerMonth: currentPrice } =
    hourlyAndMonthlyCostsForContainers(
      service.containerCount,
      currentContainerProfile,
      service.containerMemoryLimitMb,
    );
  const { pricePerHour: estimatedPricePerHour, pricePerMonth: estimatedPrice } =
    hourlyAndMonthlyCostsForContainers(
      containerCount,
      requestedContainerProfile,
      containerSize,
    );

  const profileOptions = Object.keys(containerProfilesForStack).map(
    (profileType) => {
      const profile = getContainerProfileFromType(profileType as InstanceClass);
      return {
        label: profile.name,
        value: profileType,
      };
    },
  );

  const memoryContainerOptions = exponentialContainerSizesByProfile(
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
      <VerticalAutoscalingSection id={service.id} stackId={stack.id} />
      <Box>
        <form onSubmit={onSubmitForm}>
          <div className="flex flex-col gap-2">
            {stack.verticalAutoscaling ? (
              <h1 className="text-lg text-gray-500">Manual Scale</h1>
            ) : null}
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
                onChange={(e) =>
                  setContainerCount(parseInt(e.currentTarget.value || "0", 10))
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
                onSelect={(opt) => setContainerSize(parseInt(opt.value))}
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

          <div className="mt-2 mb-4 flex justify-between">
            <div>
              <Label>Pricing</Label>
              <p className="text-black-500">
                {service.containerCount} container
                {service.containerCount > 1 ? "s" : ""} x{" "}
                {service.containerMemoryLimitMb / 1024} GB x $
                {currentPricePerHour} per GB/hour
              </p>
            </div>
            <div>
              <p className="text-black-500">Current Estimated Monthly Cost</p>
              <p className="text-right text-lg text-green-400">
                ${currentPrice}
              </p>
            </div>
          </div>

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
            <div className="my-3 flex justify-between">
              <div>
                <div className="text-md text-gray-900">Pricing</div>
                <p className="text-black-500">
                  {containerCount} container
                  {containerCount > 1 || containerCount === 0 ? "s" : ""} x{" "}
                  {containerSize / 1024} GB x ${estimatedPricePerHour} per
                  GB/hour
                </p>
              </div>
              <div>
                <p className="text-black-500">New Estimated Monthly Cost</p>
                <p className="text-right text-lg text-green-400">
                  ${estimatedPrice}
                </p>
              </div>
            </div>
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
