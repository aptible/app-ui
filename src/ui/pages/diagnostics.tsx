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
          <DescBar>2 Diagnostics</DescBar>
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Header 1</Th>
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
          </Tr>
        </TBody>
      </Table>
    </AppSidebarLayout>
  );
};
