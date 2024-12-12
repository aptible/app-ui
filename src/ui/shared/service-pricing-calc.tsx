import { estimateMonthlyCost, formatCurrency } from "@app/deploy";
import { useSelector } from "@app/react";
import { schema } from "@app/schema";
import type {
  DeployBackup,
  DeployDisk,
  DeployEndpoint,
  DeployService,
} from "@app/types";
import { Label } from "./form-group";

export type ServicePricingCalcProps = {
  service: DeployService;
  disk?: DeployDisk;
  endpoints?: DeployEndpoint[];
  backups?: DeployBackup[];
};

export function ServicePricingCalc({
  service,
  disk,
  endpoints = [],
  backups = [],
}: ServicePricingCalcProps) {
  const disks = disk == null ? [] : [disk];
  const cost = useSelector((s) =>
    estimateMonthlyCost(s, {
      services: [service],
      disks,
      endpoints,
      backups,
    }),
  );
  const rates = useSelector(schema.costRates.select);

  let costPerGBHour = rates.m_class_gb_per_hour;
  if (service.instanceClass.startsWith("r")) {
    costPerGBHour = rates.r_class_gb_per_hour;
  } else if (service.instanceClass.startsWith("c")) {
    costPerGBHour = rates.c_class_gb_per_hour;
  }
  const containerCost = useSelector((s) =>
    estimateMonthlyCost(s, { services: [service] }),
  );
  const endpointCost = useSelector((s) =>
    estimateMonthlyCost(s, { endpoints }),
  );
  const backupCost = useSelector((s) => estimateMonthlyCost(s, { backups }));
  const diskCost = useSelector((s) => estimateMonthlyCost(s, { disks }));

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
                {disk.size} GB disk x{" "}
                {formatCurrency(rates.disk_cost_gb_per_month)} per GB/month
                {disk.provisionedIops > 3000
                  ? ` + ${disk.provisionedIops - 3000} IOPS x ${formatCurrency(rates.disk_iops_cost_per_month)} per month`
                  : ""}
              </div>
              <div>
                = {formatCurrency(diskCost)}
                /month
              </div>
            </>
          )}
          {endpoints.length > 0 ? (
            <>
              <div>
                {endpoints.length} endpoint{endpoints.length > 1 ? "s" : ""} x{" "}
                {formatCurrency(rates.vhost_cost_per_hour)} per hour
              </div>
              <div>= {formatCurrency(endpointCost)}/month</div>
            </>
          ) : null}
          {backups.length > 0 ? (
            <>
              <div>
                {backupSize} GB backups x{" "}
                {formatCurrency(rates.backup_cost_gb_per_month)} per GB/month
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
