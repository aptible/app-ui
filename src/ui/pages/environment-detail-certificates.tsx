import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

import type { AppState } from "@app/types";

import { InputSearch, LoadResources } from "../shared";
import { fetchCertificates, selectCertificatesByEnvId } from "@app/deploy";
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

  return (
    <LoadResources query={query} isEmpty={certificates.length === 0}>
      <div className="mt-4">
        <div className="flex justify-between w-100">
          <div className="flex w-1/2">
            {/* <ButtonIcon icon={<IconPlusCircle />}>New Certificate</ButtonIcon> */}
          </div>
          <div className="flex w-1/2 justify-end">
            <InputSearch
              className="self-end float-right]"
              placeholder="Search certificates..."
              search={search}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </LoadResources>
  );
};
