import { useEffect } from "react";
import { useParams } from "react-router";
import { useCache, useQuery } from "saga-query/react";

import type { HalEmbedded } from "@app/types";

import { EmptyResources, Loading } from "../shared";
import { fetchCertificates, HalBackups } from "@app/deploy";
import { DatabaseBackupsList } from "../shared/db/backup-list";

export const EnvironmentCertificatesPage = () => {
  const { id = "" } = useParams();
  const query = useQuery(fetchCertificates({ id }));

  return null;
};
