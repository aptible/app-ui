import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { DeployBackupRetentionPolicy, LinkResponse } from "@app/types";

export interface BackupRpResponse {
  id: number;
  daily: number;
  monthly: number;
  yearly: number;
  make_copy: boolean;
  keep_final: boolean;
  created_at: string;
  _type: "backup_retention_policy";
  _links: {
    account: LinkResponse;
  };
}

export const defaultBackupRpResponse = (
  rp: Partial<BackupRpResponse> = {},
): BackupRpResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    daily: 0,
    monthly: 0,
    yearly: 0,
    make_copy: false,
    keep_final: false,
    created_at: now,
    _type: "backup_retention_policy",
    _links: {
      account: defaultHalHref(),
    },
    ...rp,
  };
};

const deserializeBackupRp = (
  bk: BackupRpResponse,
): DeployBackupRetentionPolicy => {
  return {
    id: `${bk.id}`,
    daily: bk.daily,
    monthly: bk.monthly,
    yearly: bk.yearly,
    makeCopy: bk.make_copy,
    keepFinal: bk.keep_final,
    environmentId: extractIdFromLink(bk._links.account),
    createdAt: bk.created_at,
  };
};

export const hasDeployBackupRp = (rp: DeployBackupRetentionPolicy) => !!rp.id;
export const selectBackupRpById = schema.backupRps.selectById;
export const selectLatestBackupRpByEnvId = createSelector(
  schema.backupRps.selectTableAsList,
  (_: WebState, p: { envId: string }) => p.envId,
  (brps, envId) => {
    const bb = brps
      .filter((brp) => brp.environmentId === envId)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

    if (bb.length === 0) {
      return schema.backupRps.empty;
    }

    return bb[0];
  },
);

export const backupRpEntities = {
  backup_retention_policy: defaultEntity({
    id: "backup_retention_policy",
    deserialize: deserializeBackupRp,
    save: schema.backupRps.add,
  }),
};

export interface UpdateBackupRp {
  daily: number;
  monthly: number;
  yearly: number;
  keepFinal: boolean;
  makeCopy: boolean;
  envId: string;
  id: string;
}

export const fetchBackupRp = api.get<{ envId: string }>(
  "/accounts/:envId/backup_retention_policies",
);
export const updateBackupRp = api.post<UpdateBackupRp>(
  "/accounts/:envId/backup_retention_policies",
  function* (ctx, next) {
    const { daily, monthly, yearly, makeCopy, keepFinal, id } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({
        daily,
        monthly,
        yearly,
        make_copy: makeCopy,
        keep_final: keepFinal,
      }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Successfully updated backup retention policy!" };
    // delete old BRP since we are creating new ones
    yield* schema.update(schema.backupRps.remove([id]));
  },
);
