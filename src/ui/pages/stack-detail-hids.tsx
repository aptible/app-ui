import { prettyDate } from "@app/date";
import { fetchStackManagedHids, selectStackById } from "@app/deploy";
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
  Loading,
  ResourceListView,
  TableHead,
  Td,
  Tr,
  tokens,
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
    <Button size="sm" variant="white" onClick={onClick} isLoading={loading}>
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
      <Td>
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
      <Group variant="horizontal" size="sm" className="items-center">
        <Button
          variant="white"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev Page
        </Button>
        <div>{page}</div>
        <Button
          variant="white"
          disabled={page === lastPage}
          onClick={() => setPage(page + 1)}
        >
          Next Page
        </Button>
      </Group>

      <ResourceListView
        tableHeader={<TableHead headers={headers} />}
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

  return (
    <Group>
      <h2 className={tokens.type.h2}>Managed HIDS Evidence</h2>
      <p>
        Aptible operates a host-level Intrusion Detection System (HIDS) on all
        Deploy instances for the <strong>{stack.name}</strong> stack, and
        periodically generates reports that you can use as evidence of HIDS when
        you're audited. The intrusion detection reports listed below are
        relevant to the applications and databases deployed in the environments
        deployed on this stack.
      </p>
      <p>They are posted here on a weekly basis.</p>
      <ReportTable stack={stack} />
    </Group>
  );
};
