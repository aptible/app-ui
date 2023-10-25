import { prettyEnglishDate } from "@app/date";
import {
  downloadActivityReports,
  fetchEnvActivityReports,
  selectActivityReportsByEnvId,
} from "@app/deploy";
import { AppState, DeployActivityReport } from "@app/types";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";
import { usePaginate } from "../hooks";
import {
  ButtonIcon,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  IconDownload,
  PaginateBar,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
} from "../shared";

const ActivityReportListRow = ({
  report,
}: {
  report: DeployActivityReport;
}) => {
  const dispatch = useDispatch();
  return (
    <Tr>
      <Td className="text-gray-900">{prettyEnglishDate(report.createdAt)}</Td>
      <Td className="text-gray-900">{prettyEnglishDate(report.startsAt)}</Td>
      <Td className="text-gray-900">{prettyEnglishDate(report.endsAt)}</Td>
      <Td className="flex gap-2 justify-end mr-4">
        <ButtonIcon
          icon={<IconDownload className="-mr-1" variant="sm" />}
          onClick={() => {
            dispatch(
              downloadActivityReports({
                id: report.id,
                filename: report.filename,
              }),
            );
          }}
          variant="primary"
          size="sm"
        >
          CSV
        </ButtonIcon>
      </Td>
    </Tr>
  );
};

export const EnvironmentActivityReportsPage = () => {
  const { id = "" } = useParams();
  const reports = useSelector((s: AppState) =>
    selectActivityReportsByEnvId(s, { envId: id }),
  );
  useQuery(fetchEnvActivityReports({ id }));
  const paginated = usePaginate(reports);

  return (
    <Group>
      <Group size="sm">
        <TitleBar description="Weekly CSV downloads that list all environment operations.">
          Activity Reports
        </TitleBar>

        <FilterBar>
          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Reports</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Posted</Th>
          <Th>From Date</Th>
          <Th>To Date</Th>
          <Th>Download</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={4} /> : null}
          {paginated.data.map((report) => (
            <ActivityReportListRow key={report.id} report={report} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
