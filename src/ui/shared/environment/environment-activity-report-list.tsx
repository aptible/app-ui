import { ButtonIcon } from "../button";
import { IconDownload } from "../icons";
import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { prettyEnglishDateWithTime } from "@app/date";
import { downloadActivityReports } from "@app/deploy";
import { DeployActivityReport } from "@app/types";
import { useDispatch } from "react-redux";

const ActivityReportListRow = ({
  report,
}: {
  report: DeployActivityReport;
}) => {
  const dispatch = useDispatch();
  return (
    <tr className="group hover:bg-gray-50" key={`${report.id}`}>
      <Td>{prettyEnglishDateWithTime(report.createdAt)}</Td>
      <Td>{prettyEnglishDateWithTime(report.startsAt)}</Td>
      <Td>{prettyEnglishDateWithTime(report.endsAt)}</Td>
      <Td>
        <ButtonIcon
          icon={<IconDownload className="-mr-2" variant="sm" />}
          onClick={() => {
            dispatch(
              downloadActivityReports({
                id: report.id,
                filename: report.filename,
              }),
            );
          }}
          variant="white"
        />
      </Td>
    </tr>
  );
};
export const ActivityReportListByEnvironment = ({
  reports,
}: { reports: DeployActivityReport[] }) => {
  return (
    <div className="my-4">
      <p className="text-gray-500 mb-4 text-base">
        {reports.length} Activity Report{reports.length !== 1 && "s"}
      </p>
      <ResourceListView
        tableHeader={
          <TableHead headers={["Posted", "From Date", "To Date", "Download"]} />
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
