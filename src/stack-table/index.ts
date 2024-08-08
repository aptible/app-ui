import {
  estimateMonthlyCost,
  findBackupsByEnvId,
  findDisksByEnvId,
  findEndpointsByEnvId,
  findEnvironmentsByStackId,
  findServicesByEnvId,
  findVpnTunnelsByStackId,
  getStackType,
  selectBackupsAsList,
  selectDisksAsList,
  selectEndpointsAsList,
  selectEnvironmentsAsList,
  selectServices,
  selectStacksByOrgAsList,
  selectVpnTunnelsAsList,
} from "@app/deploy";
import { createSelector } from "@app/fx";
import type { WebState } from "@app/schema";
import type { DeployStack } from "@app/types";

export interface DeployStackRow extends DeployStack {
  cost: number;
}

export const selectStacksForTableSearch = createSelector(
  selectStacksByOrgAsList,
  (_: WebState, p: { search: string }) => p.search,
  selectEnvironmentsAsList,
  selectServices,
  selectDisksAsList,
  selectEndpointsAsList,
  selectBackupsAsList,
  selectVpnTunnelsAsList,
  (
    stacks,
    search,
    environments,
    services,
    disks,
    endpoints,
    backups,
    vpnTunnels,
  ): DeployStackRow[] => {
    let results = stacks;
    if (search !== "") {
      const searchLower = search.toLocaleLowerCase();

      results = stacks.filter((stack) => {
        const name = stack.name.toLocaleLowerCase();
        const region = stack.region.toLocaleLowerCase();
        const type = getStackType(stack);

        const nameMatch = name.includes(searchLower);
        const regionMatch = region.includes(searchLower);
        const typeMatch = type.includes(searchLower);
        const idMatch = searchLower === stack.id;

        return nameMatch || regionMatch || typeMatch || idMatch;
      });
    }

    return results
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((stack) => {
        const envs = findEnvironmentsByStackId(environments, stack.id);

        const cost = estimateMonthlyCost({
          services: envs.flatMap((env) =>
            findServicesByEnvId(Object.values(services), env.id),
          ),
          disks: envs.flatMap((env) => findDisksByEnvId(disks, env.id)),
          endpoints: envs.flatMap((env) =>
            findEndpointsByEnvId(endpoints, services, env.id),
          ),
          backups: envs.flatMap((env) => findBackupsByEnvId(backups, env.id)),
          vpnTunnels: findVpnTunnelsByStackId(vpnTunnels, stack.id),
          stacks: [stack],
        });

        return { ...stack, cost };
      });
  },
);
