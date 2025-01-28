import { dateFromToday } from "@app/date";
import {
  GB,
  getContainerProfileFromType,
  selectAutoscalingEnabledById,
  selectManualScaleRecommendationByServiceId,
  selectServiceById,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { useSelector } from "@app/react";
import {
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  databaseMetricsUrl,
  databaseScaleUrl,
} from "@app/routes";
import { tunaEvent } from "@app/tuna";
import type {
  DeployService,
  InstanceClass,
  ManualScaleRecommendation,
} from "@app/types";
import { Link, useNavigate } from "react-router-dom";
import { Banner } from "./banner";
import { Group } from "./group";
import {
  IconAutoscale,
  IconInfo,
  IconScaleCheck,
  IconScaleDown,
  IconScaleUp,
} from "./icons";
import { Pill } from "./pill";
import { Tooltip } from "./tooltip";

const isManualScaleRecValid = (
  service: DeployService,
  rec: ManualScaleRecommendation,
) => {
  if (rec.id === "") {
    return { isValid: false, isProfileSame: true, isSizeSame: true };
  }
  const isProfileRecSame = service.instanceClass.startsWith(
    rec.recommendedInstanceClass,
  );
  const isSizeRecSame =
    service.containerMemoryLimitMb === rec.recommendedContainerMemoryLimitMb;

  // has profile changed since we made rec?
  const hasProfileChanged = service.instanceClass !== rec.instanceClassAtTime;
  // has container size changed since we made rec?
  const hasSizeChanged =
    service.containerMemoryLimitMb !== rec.containerMemoryLimitMbAtTime;

  // we want to expire recommendations that are greater than X days old
  const withinTimelimit = new Date(rec.createdAt) > dateFromToday(2);
  const isValid = !hasProfileChanged || !hasSizeChanged || !withinTimelimit;
  return { isValid, isProfileRecSame, isSizeRecSame };
};

export const ManualScaleReason = ({
  serviceId,
  children,
}: { serviceId: string; children: React.ReactNode }) => {
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));
  const rec = useSelector((s) =>
    selectManualScaleRecommendationByServiceId(s, { serviceId: serviceId }),
  );
  const { isValid, isProfileRecSame, isSizeRecSame } = isManualScaleRecValid(
    service,
    rec,
  );

  if (!isValid) {
    return null;
  }

  const recProfile = getContainerProfileFromType(
    `${rec.recommendedInstanceClass}5` as InstanceClass,
  );

  let msg = "We recommend";
  if (!isProfileRecSame) {
    msg += ` modifying your container profile to ${recProfile.name} class`;
  }
  if (!isProfileRecSame && !isSizeRecSame) {
    msg += " and ";
  }
  if (!isSizeRecSame) {
    msg += ` modifying your container size to ${rec.recommendedContainerMemoryLimitMb / GB} GB`;
  }

  return (
    <Banner variant="info" showIcon={false} className="mb-4">
      <Group variant="horizontal" className="items-center">
        <div className="flex flex-col items-center">
          <ManualScaleRecView serviceId={serviceId} />
        </div>
        <div className="flex-1">
          <Group variant="horizontal" size="sm" className="items-center">
            <span className="font-bold">Scaling Recommendation</span>
            <Tooltip
              text="This recommendation is updated daily based on CPU 95P, RSS MAX in
            the last 14 days. See docs for more information on how it's
            calculated."
            >
              <IconInfo variant="sm" />
            </Tooltip>
          </Group>
          <span>{msg}. </span>
          <Link
            to={
              service.appId
                ? appServicePathMetricsUrl(service.appId, service.id)
                : databaseMetricsUrl(service.databaseId)
            }
          >
            See metrics
          </Link>{" "}
          to review usage before scaling.
        </div>
        <div>{children}</div>
      </Group>
    </Banner>
  );
};

export const ManualScaleRecView = ({ serviceId }: { serviceId: string }) => {
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));
  const rec = useSelector((s) =>
    selectManualScaleRecommendationByServiceId(s, { serviceId: serviceId }),
  );
  const org = useSelector(selectOrganizationSelected);
  const { isValid } = isManualScaleRecValid(service, rec);
  const savings = rec.costSavings;
  const navigate = useNavigate();
  const noSavings = savings === 0;
  const savingsThreadhold = savings > 0 && savings < 150;
  const noRec = rec.id === "";

  if (noRec || !isValid || noSavings || savingsThreadhold) {
    return (
      <Pill className="w-max" icon={<IconScaleCheck variant="sm" />}>
        <span className="text-black">Right Sized</span>
      </Pill>
    );
  }
  const url = service.appId
    ? appServiceScalePathUrl(service.appId, serviceId)
    : databaseScaleUrl(service.databaseId);

  const scaleDir = savings < 0 ? "up" : "down";

  const onScale = () => {
    navigate(url);
    tunaEvent(
      `scale-service-click-${scaleDir}`,
      JSON.stringify({
        orgId: org.id,
        orgName: org.name,
        serviceId,
        direction: scaleDir,
      }),
    );
  };

  if (scaleDir === "up") {
    return (
      <div onClick={onScale} onKeyUp={onScale} className="cursor-pointer">
        <Pill
          className="w-max"
          variant="error"
          icon={<IconScaleUp variant="sm" />}
        >
          Scale Up
        </Pill>
      </div>
    );
  }

  return (
    <>
      <div onClick={onScale} onKeyUp={onScale} className="cursor-pointer">
        <Pill
          className="w-max"
          variant="progress"
          icon={<IconScaleDown variant="sm" />}
        >
          Scale Down
        </Pill>
      </div>
      <div>Save up to ${savings.toFixed(2)}</div>
    </>
  );
};

export const ScaleRecsView = ({ service }: { service: DeployService }) => {
  const enabled = useSelector((s) =>
    selectAutoscalingEnabledById(s, { id: service.serviceSizingPolicyId }),
  );
  return (
    <div>
      {enabled ? (
        <Pill className="w-max" icon={<IconAutoscale variant="sm" />}>
          <span className="text-black">Autoscaling</span>
        </Pill>
      ) : null}
      {enabled ? null : <ManualScaleRecView serviceId={service.id} />}
    </div>
  );
};
