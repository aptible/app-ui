import { prettyDate } from "@app/date";
import { useRef } from "react";
import { ButtonIcon } from "./button";
import { IconDownload } from "./icons";

const today = prettyDate(new Date().toISOString());
export function CsvButton({
  csv,
  title,
}: { csv: () => string; title: string }) {
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const downloadUsers = () => {
    if (downloadRef.current) {
      // https://stackoverflow.com/a/25975345
      const csvData = new Blob([csv()], { type: "text/csv" });
      const csvUrl = URL.createObjectURL(csvData);
      downloadRef.current.setAttribute("href", csvUrl);
      downloadRef.current.click();
    }
  };

  return (
    <>
      <ButtonIcon
        icon={<IconDownload variant="sm" />}
        onClick={downloadUsers}
        variant="white"
      >
        CSV
      </ButtonIcon>
      <a
        ref={downloadRef}
        style={{ display: "none" }}
        download={`${title}_${today}.csv`}
        href="data:text/csv"
        aria-label="download"
      >
        download
      </a>
    </>
  );
}
