import { selectDatabaseImageById } from "@app/deploy";
import { useSelector } from "@app/react";
import type { DeployDatabase } from "@app/types";
import { Link } from "react-router-dom";
import { Banner } from "../banner";

const BannerWrapper = ({
  children,
}: {
  children?: React.ReactNode;
}) => <div className="mb-4">{children}</div>;

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

  if (depDate > curDate) {
    return (
      <BannerWrapper>
        <Banner variant="info">
          <p>
            <b>
              Active maintenance for the {image.description} database version
              will end on {depDate.toUTCString()}.
            </b>{" "}
            We recommend upgrading to a{" "}
            <Link to="https://www.aptible.com/docs/core-concepts/managed-databases/supported-databases/overview">
              newer version for continued support.
            </Link>
          </p>
        </Banner>
      </BannerWrapper>
    );
  }

  if (depDate < curDate) {
    return (
      <BannerWrapper>
        <Banner variant="info">
          <p>
            <b>
              The {image.description} database version is deprecated and no
              longer maintained.
            </b>{" "}
            We recommend upgrading to a{" "}
            <Link to="https://www.aptible.com/docs/core-concepts/managed-databases/supported-databases/overview">
              newer version for continued support.
            </Link>
          </p>
        </Banner>
      </BannerWrapper>
    );
  }

  // return null
  return null;
};
