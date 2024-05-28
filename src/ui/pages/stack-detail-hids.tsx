import { fileDate, prettyDate } from "@app/date";
import {
  type HidsReport,
  fetchStackManagedHids,
  getStackType,
  hasDeployStack,
  selectStackById,
} from "@app/deploy";
import { useCache, useSelector } from "@app/react";
import { selectAccessToken } from "@app/token";
import type { DeployStack } from "@app/types";
import { useState } from "react";
import { useParams } from "react-router";
import {
  Banner,
  BannerMessages,
  Button,
  EmptyTr,
  Group,
  IconDownload,
  Loading,
  PaginateBar,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
} from "../shared";

const DownloadReport = ({
  url,
  filename,
  children,
}: { url: string; filename: string; children: React.ReactNode }) => {
  const token = useSelector(selectAccessToken);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const shortLivedUrl = await resp.text();
    const shortResp = await fetch(shortLivedUrl);
    const blobData = await shortResp.blob();

    const blobUrl = window.URL.createObjectURL(blobData);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setLoading(true);
    fetchReport().finally(() => setLoading(false));
  };

  return (
    <Button size="sm" variant="primary" onClick={onClick} isLoading={loading}>
      <IconDownload className="mr-1" variant="sm" />
      {children}
    </Button>
  );
};

const ReportView = ({
  report,
  stack,
}: { report: HidsReport; stack: DeployStack }) => {
  const date = prettyDate(report.created_at);
  const fdate = fileDate(report.created_at);
  return (
    <Tr>
      <Td>{date}</Td>
      <Td>{prettyDate(report.starts_at)}</Td>
      <Td>{prettyDate(report.ends_at)}</Td>
      <Td variant="right">
        <Group variant="horizontal" size="sm">
          <DownloadReport
            filename={`report-${stack.name}-${fdate}.csv`}
            url={report._links.download_csv.href}
          >
            CSV
          </DownloadReport>
          <DownloadReport
            filename={`report-${stack.name}-${fdate}.pdf`}
            url={report._links.download_pdf.href}
          >
            PDF
          </DownloadReport>
        </Group>
      </Td>
    </Tr>
  );
};

const ReportTable = ({ stack }: { stack: DeployStack }) => {
  const [page, setPage] = useState(1);
  const loader = useCache(fetchStackManagedHids({ id: stack.id, page }));

  if (!stack.exposeIntrusionDetectionReports) {
    return (
      <div>We cannot expose intrusion detection reports for this stack.</div>
    );
  }

  if (loader.isInitialLoading) {
    return <Loading />;
  }

  if (loader.isError) {
    return <BannerMessages {...loader} />;
  }

  const data = loader.data;
  if (!data) {
    return (
      <Banner variant="error">Unable to fetch managed HIDS evidence.</Banner>
    );
  }
  const lastPage = Math.ceil((data.total_count || 0) / (data.per_page || 0));
  const reports = data._embedded.intrusion_detection_reports;

  return (
    <>
      <Group variant="horizontal" size="sm" className="items-center">
        <PaginateBar
          page={page}
          totalPages={lastPage}
          prev={() => setPage(page - 1)}
          next={() => setPage(page + 1)}
        />

        <div className="ml-2 text-gray-500">
          Weekly Host-level Intrusion Detection System (HIDS) reports for
          auditing evidence. This report applies to all resources and
          environments in this stack.
        </div>
      </Group>

      <Table>
        <THead>
          <Th>Posted Date</Th>
          <Th>From Date</Th>
          <Th>To Date</Th>
          <Th>Download</Th>
        </THead>

        <TBody>
          {reports.length === 0 ? <EmptyTr colSpan={4} /> : null}
          {reports.map((report) => (
            <ReportView key={report.id} report={report} stack={stack} />
          ))}
        </TBody>
      </Table>
    </>
  );
};

export const StackDetailHidsPage = () => {
  const { id = "" } = useParams();
  const stack = useSelector((s) => selectStackById(s, { id }));
  const displayNotice =
    hasDeployStack(stack) && getStackType(stack) === "shared";

  return (
    <Group>
      {displayNotice ? (
        <Banner variant="warning">
          Note: This stack is shared tenancy. If you are looking for HIDS
          evidence to pass an audit, you probably need to download reports from
          a dedicated tenancy stack instead.
        </Banner>
      ) : null}

      <ReportTable stack={stack} />
    </Group>
  );
};
