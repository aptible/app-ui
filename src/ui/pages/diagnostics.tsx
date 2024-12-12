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
              <IconPlusCircle variant="sm" className="mr-2" /> New Diagnostics
            </ButtonLink>
          </ActionBar>
        </div>

        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>1 Diagnostics</DescBar>
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Topic</Th>
          <Th>Resource</Th>
          <Th>Environment</Th>
          <Th>Created</Th>
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
              <Link to="/databases/138671/metrics" className="flex">
                <p className="flex flex-col">
                  <span className={tokens.type["table link"]}>app-ui</span>
                  <span className={tokens.type["normal lighter"]}>
                    Database
                  </span>
                </p>
              </Link>
            </Td>
            <Td className="flex-1">
              <div className="flex">
                <Link className="flex">
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
              <p>2024-11-16 01:11:18 UTC</p>
            </Td>
          </Tr>
        </TBody>
      </Table>
    </AppSidebarLayout>
  );
};