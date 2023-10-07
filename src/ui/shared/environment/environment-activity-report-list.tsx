import { prettyEnglishDate } from "@app/date";
import { downloadActivityReports } from "@app/deploy";
import { DeployActivityReport } from "@app/types";
import { useDispatch } from "react-redux";
import { ButtonIcon } from "../button";
import { IconDownload } from "../icons";
import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";

const ActivityReportListRow = ({
  report,
}: {
  report: DeployActivityReport;
}) => {
  const dispatch = useDispatch();
  return (
    <tr className="group hover:bg-gray-50" key={`${report.id}`}>
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
    </tr>
  );
};
export const ActivityReportListByEnvironment = ({
  reports,
}: { reports: DeployActivityReport[] }) => {
  return (
    <div className="mt-2">
      <p className="text-gray-500 mb-4 text-base">
        {reports.length} Activity Report{reports.length !== 1 && "s"}
        <span className="pl-4">
          Weekly CSV downloads that list all environment operations.
        </span>
      </p>
      <ResourceListView
        tableHeader={
          <TableHead
            rightAlignedFinalCol
            headers={["Posted", "From Date", "To Date", "Download"]}
          />
        }
        tableBody={
          <>
            {reports.map((report) => (
              <ActivityReportListRow key={report.id} report={report} />
            ))}
          </>
        }
      />
    </div>
  );
};
