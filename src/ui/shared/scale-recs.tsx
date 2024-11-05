import { dateFromToday } from "@app/date";
import {
  GB,
  getContainerProfileFromType,
  selectAutoscalingEnabledById,
  selectManualScaleRecommendationByServiceId,
  selectServiceById,
} from "@app/deploy";
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
  IconScaleCheck,
  IconScaleDown,
  IconScaleUp,
} from "./icons";
import { Pill } from "./pill";

const isManualScaleRecValid = (
  service: DeployService,
  rec: ManualScaleRecommendation,
) => {
  if (rec.id === "") {
    return { isValid: false, isProfileSame: true, isSizeSame: true };
  }
  const isProfileSame = service.instanceClass.startsWith(
    rec.recommendedInstanceClass,
  );

  const isSizeSame =
    service.containerMemoryLimitMb === rec.recommendedContainerMemoryLimitMb;
  // we want to expire recommendations that are greater than X days old
  const withinTimelimit = new Date(rec.createdAt) > dateFromToday(2);
  const isValid = !isProfileSame || !isSizeSame || !withinTimelimit;
  return { isValid, isProfileSame, isSizeSame };
};

export const ManualScaleReason = ({
  serviceId,
  children,
}: { serviceId: string; children: React.ReactNode }) => {
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));
  const rec = useSelector((s) =>
    selectManualScaleRecommendationByServiceId(s, { serviceId: serviceId }),
  );
  const { isValid, isProfileSame, isSizeSame } = isManualScaleRecValid(
    service,
    rec,
  );

  if (!isValid) {
    return null;
  }

  const recProfile = getContainerProfileFromType(
    `${rec.recommendedInstanceClass}5` as InstanceClass,
  );

  let msg = "Based on container metrics in the last 14 days, we recommend";
  if (!isProfileSame) {
    msg += ` modifying your container profile to ${recProfile.name} class`;
  }
  if (!isProfileSame && !isSizeSame) {
    msg += " and ";
  }
  if (!isSizeSame) {
    msg += ` modifying your container size to ${rec.recommendedContainerMemoryLimitMb / GB} GB`;
  }

  return (
    <Banner variant="info" showIcon={false} className="mb-4">
      <Group variant="horizontal" className="items-center">
        <div className="flex flex-col items-center">
          <ManualScaleRecView serviceId={serviceId} />
        </div>
        <div className="flex-1">
          <span>{msg}. </span>
          <span className="font-bold">
            We recommend conducting your own container and usage review before
            scaling.{" "}
          </span>
          <Link
            to={
              service.appId
                ? appServicePathMetricsUrl(service.appId, service.id)
                : databaseMetricsUrl(service.databaseId)
            }
          >
            See metrics
          </Link>
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
  const { isValid } = isManualScaleRecValid(service, rec);
  const savings = rec.costSavings;
  const navigate = useNavigate();
  const noSavings = savings === 0;
  const savingsThreadhold = savings > 0 && savings < 150;

  if (rec.id === "") {
    return null;
  }

  if (!isValid || noSavings || savingsThreadhold) {
    return (
      <Pill icon={<IconScaleCheck variant="sm" />}>
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
      JSON.stringify({ serviceId, direction: scaleDir }),
    );
  };

  if (scaleDir === "up") {
    return (
      <div onClick={onScale} onKeyUp={onScale} className="cursor-pointer">
        <Pill variant="error" icon={<IconScaleUp variant="sm" />}>
          Scale Up
        </Pill>
      </div>
    );
  }

  return (
    <>
      <div onClick={onScale} onKeyUp={onScale} className="cursor-pointer">
        <Pill variant="progress" icon={<IconScaleDown variant="sm" />}>
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
        <Pill icon={<IconAutoscale variant="sm" />}>
          <span className="text-black">Autoscaling</span>
        </Pill>
      ) : null}
      {enabled ? null : <ManualScaleRecView serviceId={service.id} />}
    </div>
  );
};
