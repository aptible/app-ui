import {
  fetchAllCertsByEnvId,
  getCertLabel,
  selectCertificatesByEnvId,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { Select, SelectOption } from "./select";

export const CertSelector = ({
  envId,
  onSelect,
  selectedId,
  className = "",
}: {
  envId: string;
  onSelect: (opt: SelectOption) => void;
  selectedId: string;
  className?: string;
}) => {
  useQuery(fetchAllCertsByEnvId({ id: envId }));
  const certs = useSelector((s) => selectCertificatesByEnvId(s, { envId }));
  const options: SelectOption[] = [
    { label: "Select an Existing Certificate", value: "" },
  ];
  certs.forEach((cert) => {
    options.push({ label: getCertLabel(cert), value: cert.id });
  });

  return (
    <Select
      id="existing-cert"
      ariaLabel="existing-cert"
      options={options}
      onSelect={onSelect}
      value={selectedId}
      className={className}
    />
  );
};
