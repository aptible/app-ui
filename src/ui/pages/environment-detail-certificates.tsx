import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useCache, useQuery } from "saga-query/react";

import type { AppState, HalEmbedded } from "@app/types";

import {
  ButtonIcon,
  EmptyResources,
  IconPlusCircle,
  InputSearch,
  Loading,
  LoadResources,
} from "../shared";
import {
  fetchCertificates,
  HalBackups,
  selectCertificatesAsList,
  selectCertificatesByEnvId,
  selectEndpointsByEnvironmentId,
} from "@app/deploy";
import { DatabaseBackupsList } from "../shared/db/backup-list";
import { useSelector } from "react-redux";

export const EnvironmentCertificatesPage = () => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const { id = "" } = useParams();
  const query = useQuery(fetchCertificates({ id }));
  const certificates = useSelector((s: AppState) =>
    selectCertificatesByEnvId(s, { envId: id }),
  );
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByEnvironmentId(s, { envId: id }),
  );

  return (
    <LoadResources query={query} isEmpty={certificates.length === 0}>
      <div className="mt-4">
        <div className="flex justify-between w-100">
          <div className="flex w-1/2">
            <ButtonIcon icon={<IconPlusCircle />}>New Certificate</ButtonIcon>
          </div>
          <div className="flex w-1/2 justify-end">
            <InputSearch
              className="self-end float-right]"
              placeholder="Search certificates ..."
              search={search}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </LoadResources>
  );
};
