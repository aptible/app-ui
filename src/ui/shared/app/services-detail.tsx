import { SyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { calcServiceMetrics, selectServicesByIds } from "@app/deploy";
import { AppState, DeployService } from "@app/types";

import { ButtonIcon } from "../button";
import { IconChevronDown, IconChevronUp, IconEllipsis } from "../icons";
import { InputSearch } from "../input";
import { PreCode, listToInvertedTextColor } from "../pre-code";
import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";

const serviceListRow = ({
  service,
}: {
  service?: DeployService;
}): React.ReactNode[] => {
  if (!service) return [];
  const metrics = calcServiceMetrics(service);

  return [
    <tr key={`${service.id}`}>
      <Td className="flex-1 pl-4">
        <div className={tokens.type.darker}>{service.handle}</div>
        <div className={tokens.type["normal lighter"]}>ID: {service.id}</div>
        <div className={tokens.type["normal lighter"]}>
          {service.processType}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>{metrics.containerSizeGB} GB</div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>{service.containerCount}</div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>{service.containerCount}</div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type["normal lighter"]}>
          {metrics.containerProfile.name}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>
          ${metrics.estimatedCostInDollars}
        </div>
      </Td>

      <Td className="flex justify-end mt-2 mr-2">
        <ButtonIcon
          icon={
            <IconEllipsis className="-mr-2" style={{ width: 16, height: 16 }} />
          }
          type="submit"
          variant="white"
          size="xs"
        />
      </Td>
    </tr>,
    service.command ? (
      <tr key={`${service.id}.${service.command}`} className="border-none">
        <td colSpan={7} className="p-4">
          <span className="text-sm text-gray-500">Command</span>
          <div>
            <PreCode
              allowCopy
              segments={listToInvertedTextColor(service.command.split(" "))}
            />
          </div>
        </td>
      </tr>
    ) : null,
  ];
};

export function ServicesOverview({
  serviceIds: initialServiceIds,
}: {
  serviceIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [sortedAscending, setSortedAscending] = useState(false);
  const [serviceIds, setServiceIds] = useState<string[]>(initialServiceIds);
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const sortIconProps = {
    className: "inline",
    color: "#6b7280",
    style: { width: 14, height: 14 },
  };

  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: initialServiceIds }),
  );

  useEffect(() => {
    setServiceIds(initialServiceIds);
  }, [initialServiceIds]);

  useEffect(() => {
    if (serviceIds.length) {
      const sortedServiceIdsByName = services
        .map((service) => ({ handle: service.handle, id: service.id }))
        .sort((a, b) => (a.handle > b.handle ? 1 : 0))
        .map((service) => service.id);
      setServiceIds(sortedServiceIdsByName);
    }
  }, [services, serviceIds]);

  useEffect(() => {
    if (serviceIds.length) {
      setServiceIds([...serviceIds].reverse());
    }
  }, [sortedAscending]);

  const handleSorting = (e: SyntheticEvent) => {
    e.preventDefault;
    setSortedAscending(!sortedAscending);
  };

  return (
    <div className="mb-4">
      <ResourceListView
        header={
          <>
            <div className="flex justify-between w-100">
              <div className="flex w-1/2">
                {/* <ButtonIcon icon={<IconPlusCircle />}>New Service</ButtonIcon> */}
              </div>
              <div className="flex w-1/2 justify-end">
                <InputSearch
                  className="self-end float-right]"
                  placeholder="Search apps..."
                  search={search}
                  onChange={onChange}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-4 select-none">
              <span>{serviceIds.length} Services</span>
              <div
                className="ml-5 cursor-pointer inline"
                onClick={handleSorting}
                onKeyDown={handleSorting}
              >
                Sort: A to Z{" "}
                {sortedAscending ? (
                  <IconChevronUp {...sortIconProps} />
                ) : (
                  <IconChevronDown {...sortIconProps} />
                )}
              </div>
            </div>
          </>
        }
        tableHeader={
          <TableHead
            rightAlignedFinalCol
            headers={[
              "Service",
              "Memory Limit",
              "CPU Share",
              "Container Count",
              "Profile",
              "Monthly Cost",
              "Actions",
            ]}
          />
        }
        tableBody={
          <>
            {serviceIds.map((serviceId) =>
              serviceListRow({
                service: services.find(
                  (service: DeployService) => service.id === serviceId,
                ),
              }),
            )}
          </>
        }
      />
    </div>
  );
}
