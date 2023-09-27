import { prettyDate } from "@app/date";
import {
  fetchStackManagedHids,
  getStackType,
  hasDeployStack,
  selectStackById,
} from "@app/deploy";
import { selectAccessToken } from "@app/token";
import { AppState, DeployStack, HalEmbedded, LinkResponse } from "@app/types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useCache } from "saga-query/react";
import {
  Banner,
  BannerMessages,
  Button,
  Group,
  IconArrowLeft,
  IconArrowRight,
  IconDownload,
  Loading,
  ResourceListView,
  TableHead,
  Td,
  Tr,
} from "../shared";

interface HidsReport {
  id: number;
  created_at: string;
  starts_at: string;
  ends_at: string;
  _links: {
    download_csv: LinkResponse;
    download_pdf: LinkResponse;
  };
}

type HidsResponse = HalEmbedded<{ intrusion_detection_reports: HidsReport[] }>;

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
      <IconDownload variant="sm" />
      {children}
    </Button>
  );
};

const ReportView = ({
  report,
  stack,
}: { report: HidsReport; stack: DeployStack }) => {
  const date = prettyDate(report.created_at);
  return (
    <Tr>
      <Td>{date}</Td>
      <Td>{prettyDate(report.starts_at)}</Td>
      <Td>{prettyDate(report.ends_at)}</Td>
      <Td className="flex gap-2 justify-end mr-4">
        <Group variant="horizontal" size="sm">
          <DownloadReport
            filename={`report-${stack.name}-${date}.csv`}
            url={report._links.download_csv.href}
          >
            CSV
          </DownloadReport>
          <DownloadReport
            filename={`report-${stack.name}-${date}.pdf`}
            url={report._links.download_pdf.href}
          >
            PDF
          </DownloadReport>
        </Group>
      </Td>
    </Tr>
  );
};

const headers = ["Posted Date", "From Date", "To Date", "Download"];

const ReportTable = ({ stack }: { stack: DeployStack }) => {
  const [page, setPage] = useState(1);
  const loader = useCache<HidsResponse>(
    fetchStackManagedHids({ id: stack.id, page }),
  );

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

  return (
    <>
      <Group variant="horizontal" size="sm" className="items-center gap-2">
        <Button
          size="sm"
          variant="white"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          <IconArrowLeft color="#111920" variant="sm" />
        </Button>
        <div className="mx-1">Page {page}</div>
        <Button
          size="sm"
          variant="white"
          disabled={page === lastPage}
          onClick={() => setPage(page + 1)}
        >
          <IconArrowRight color="#111920" variant="sm" />
        </Button>
        <div className="ml-2 text-gray-500">
          Weekly Host-level Intrusion Detection System (HIDS) reports for
          auditing evidence. This report applies to all resources and
          environments in this stack.
        </div>
      </Group>

      <ResourceListView
        tableHeader={<TableHead rightAlignedFinalCol headers={headers} />}
        tableBody={
          <>
            {data._embedded.intrusion_detection_reports.map((report) => (
              <ReportView key={report.id} report={report} stack={stack} />
            ))}
          </>
        }
      />
    </>
  );
};

export const StackDetailHidsPage = () => {
  const { id = "" } = useParams();
  const stack = useSelector((s: AppState) => selectStackById(s, { id }));
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
