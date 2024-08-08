import { prettyDate } from "@app/date";
import { selectDatabaseImageById } from "@app/deploy";
import { useSelector } from "@app/react";
import type { DeployDatabase } from "@app/types";
import { Banner } from "../banner";
import { ExternalLink } from "../external-link";

export const DatabaseEolNotice = ({
  database,
}: {
  database: DeployDatabase;
}) => {
  const image = useSelector((s) =>
    selectDatabaseImageById(s, { id: database.databaseImageId }),
  );

  if (!image.eolAt) {
    return null;
  }

  const daysForDep = 90;
  const depDate = new Date(image.eolAt);
  const curDate = new Date();
  depDate.setDate(depDate.getDate() + daysForDep);
  const eolText = `Active maintenance for the ${image.description} database version will end on ${prettyDate(depDate.toISOString())}.`;
  const depText = `The ${image.description} database version is deprecated and no longer maintained.`;

  return (
    <Banner variant="info">
      <p>
        <b>{depDate > curDate ? eolText : depText}</b> We recommend upgrading to
        a{" "}
        <ExternalLink href="https://www.aptible.com/docs/core-concepts/managed-databases/supported-databases/overview">
          newer version for continued support.
        </ExternalLink>{" "}
        Refer to the{" "}
        <ExternalLink href="https://www.aptible.com/changelog/database-end-of-life-policy-updates">
          changelog
        </ExternalLink>{" "}
        for more details.
      </p>
    </Banner>
  );
};
