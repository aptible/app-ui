import { diagnosticsCreateUrl, diagnosticsDetailUrl } from "@app/routes";
import { Link } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  ActionBar,
  Banner,
  BannerMessages,
  Box,
  Button,
  ButtonLink,
  DescBar,
  FilterBar,
  FormGroup,
  Group,
  IconPlusCircle,
  Input,
  InputSearch,
  LoadingBar,
  Pill,
  Radio,
  RadioGroup,
  TBody,
  THead,
  Table,
  Td,
  TextArea,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";

export const DiagnosticsPage = () => {
  return (
    <AppSidebarLayout>
      <Banner className="mt-2">
        <strong>New Feature:</strong> Use Aptible AI to diagnose production
        issues related to increased errors, latency or availability.
      </Banner>
      <TitleBar description="Generate a dashboard displaying logs, metrics, and recent changes for any app.">
        Diagnostics
      </TitleBar>

      <FilterBar>
        <div className="flex justify-between">
          <Group variant="horizontal" size="sm" className="items-center">
            <InputSearch placeholder="Search..." />
          </Group>

          <ActionBar>
            <ButtonLink to={diagnosticsCreateUrl()}>
              <IconPlusCircle variant="sm" className="mr-2" /> Diagnose Issues
            </ButtonLink>
          </ActionBar>
        </div>

        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>1 Diagnostics</DescBar>
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Issues</Th>
          <Th>App</Th>
          <Th>Environment</Th>
          <Th>Time Range</Th>
        </THead>

        <TBody>
          <Tr>
            <Td className="flex-1">
              <Link to={diagnosticsDetailUrl()} className="flex">
                <img
                  src="/resource-types/logo-diagnostics.png"
                  className="w-[32px] h-[32px] mr-2 align-middle"
                  aria-label="App"
                />
                <p className={`${tokens.type["table link"]} leading-8`}>
                  Why is the app API error rate over 50%
                </p>
              </Link>
            </Td>
            <Td className="flex-1">
              <Link to="/apps/85039/services" className="flex">
                <p className="flex flex-col">
                  <span className={tokens.type["table link"]}>app-ui</span>
                </p>
              </Link>
            </Td>
            <Td className="flex-1">
              <div className="flex">
                <Link to="/environments/10673/apps" className="flex">
                  <p className="flex flex-col">
                    <span className={tokens.type["table link"]}>dashboard</span>
                    <span className={tokens.type["normal lighter"]}>
                      Shared Stack (us-east-1)
                    </span>
                  </p>
                </Link>
              </div>
            </Td>
            <Td className="flex-1">
              <p>2024-12-01 10:11:00 - 10:21:00 UTC</p>
            </Td>
          </Tr>
        </TBody>
      </Table>
    </AppSidebarLayout>
  );
};
