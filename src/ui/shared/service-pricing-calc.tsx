import {
  type BackupCostProps,
  type DiskCostProps,
  type EndpointCostProps,
  type ServiceCostProps,
  backupCostPerGBMonth,
  containerProfileCostPerGBHour,
  diskCostPerGBMonth,
  diskIopsCostPerMonth,
  endpointCostPerHour,
  estimateMonthlyCost,
  formatCurrency,
} from "@app/deploy";
import { Label } from "./form-group";

export type ServicePricingCalcProps = {
  service: ServiceCostProps;
  disk?: DiskCostProps;
  endpoints?: EndpointCostProps[];
  backups?: BackupCostProps[];
};

export function ServicePricingCalc({
  service,
  disk,
  endpoints = [],
  backups = [],
}: ServicePricingCalcProps) {
  const cost = estimateMonthlyCost({
    services: [service],
    disks: disk == null ? [] : [disk],
    endpoints,
    backups,
  });

  const costPerGBHour = containerProfileCostPerGBHour(service.instanceClass);
  const containerCost = estimateMonthlyCost({ services: [service] });
  const endpointCost = estimateMonthlyCost({ endpoints });
  const backupCost = estimateMonthlyCost({ backups });

  const backupSize = backups.reduce((acc, backup) => acc + backup.size, 0);

  return (
    <div className="mt-2 mb-4 flex">
      <div className="grow basis-1">
        <Label>Estimated Cost Breakdown</Label>
        <div className="grid grid-cols-[auto,1fr] gap-x-3 text-black-500">
          <div>
            1 x {service.containerMemoryLimitMb / 1024} GB container x{" "}
            {formatCurrency(costPerGBHour)} per GB/hour
          </div>
          <div>= {formatCurrency(containerCost)}/month</div>
          {disk == null ? null : (
            <>
              <div>
                {disk.size} GB disk x {formatCurrency(diskCostPerGBMonth)} per
                GB/month
                {disk.provisionedIops > 3000
                  ? ` + ${disk.provisionedIops - 3000} IOPS x ${formatCurrency(diskIopsCostPerMonth)} per month`
                  : ""}
              </div>
              <div>
                = {formatCurrency(estimateMonthlyCost({ disks: [disk] }))}
                /month
              </div>
            </>
          )}
          {endpoints.length > 0 ? (
            <>
              <div>
                {endpoints.length} endpoint{endpoints.length > 1 ? "s" : ""} x{" "}
                {formatCurrency(endpointCostPerHour)} per hour
              </div>
              <div>= {formatCurrency(endpointCost)}/month</div>
            </>
          ) : null}
          {backups.length > 0 ? (
            <>
              <div>
                {backupSize} GB backups x {formatCurrency(backupCostPerGBMonth)}{" "}
                per GB/month
              </div>
              <div>= {formatCurrency(backupCost)}/month</div>
            </>
          ) : null}
        </div>
      </div>

      <div className="grow basis-1">
        <Label>Estimated Monthly Cost</Label>
        <p className="text-lg text-green-400">{formatCurrency(cost)}</p>
        <p className="text-black-500">
          This is an estimate of the cost of running the current resources for
          one month. It is updated automatically as resources are added or
          scaled to reflect the new estimated monthly cost. Please note: it does
          not represent your actual usage for the month (ongoing scaling
          operations or deprovisioned resources are not reflected).
        </p>
      </div>
    </div>
  );
}
