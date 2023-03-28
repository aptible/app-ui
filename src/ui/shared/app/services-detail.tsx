import { AppState, DeployApp } from "@app/types";
import { calcServiceMetrics, selectServiceById } from "@app/deploy";

import {
  TableHead,
  Td,
  ResourceListView,
  Button,
  tokens,
  ResourceHeader,
  ButtonIcon,
  IconPlusCircle,
  PreCode,
  IconEllipsis,
  InputSearch,
  IconChevronDown,
} from "../../shared";
import { useSelector } from "react-redux";
import { ReactElement, useState } from "react";

const serviceListRow = ({
  serviceId,
}: { serviceId: string }): ReactElement[] => {
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const metrics = calcServiceMetrics(service);

  return [
    <tr key={`${serviceId}`}>
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

      <Td className="flex gap-2 justify-end w-40 mt-2">
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
    <tr key={`${serviceId}.${service.command}`} className="border-none">
      <td colSpan={7} className="p-4">
        <span className="text-sm text-gray-500">Command</span>
        <div>
          <PreCode
            invertedColors={false}
            allowCopy
            text={service.command.split(" ")}
          />
        </div>
      </td>
    </tr>,
  ];
};

export function ServicesOverview({ app }: { app: DeployApp }) {
  // TODO - since app is already passed in, do we just want to have a utility or method on app itself
  // that lets us filter on it OOP-style? or some other mechanic to filter an app's services for this page?
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <div className="mb-4">
      <ResourceListView
        header={
          <>
            <div className="flex justify-between w-100">
              <div className="flex w-1/2">
                <ButtonIcon icon={<IconPlusCircle />}>New Service</ButtonIcon>
              </div>
              <div className="flex w-1/2 justify-end">
                <InputSearch
                  className="self-end float-right]"
                  placeholder="Search apps ..."
                  search={search}
                  onChange={onChange}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <span>{app.serviceIds.length} Services</span>
              <span className="ml-5 cursor-pointer">
                Sort: A to Z{" "}
                <IconChevronDown
                  className="inline"
                  color="#6b7280"
                  style={{ width: 14, height: 14 }}
                />
              </span>
            </p>
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
            {app.serviceIds.map((serviceId) => serviceListRow({ serviceId }))}
          </>
        }
      />
    </div>
  );
}
