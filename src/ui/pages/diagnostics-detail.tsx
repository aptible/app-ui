import { diagnosticsDetailUrl, diagnosticsUrl } from "@app/routes";
import { Link } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  ButtonDestroy,
  ButtonIcon,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  FormGroup,
  Group,
  IconAI,
  IconExternalLink,
  IconThumbsUp,
  Input,
  Radio,
  RadioGroup,
  TextArea,
  TitleBar,
  Tooltip,
  tokens,
} from "../shared";

export const DiagnosticsDetailPage = () => {
  return (
    <AppSidebarLayout>
      <Breadcrumbs
        crumbs={[
          {
            name: "Diagnostics",
            to: diagnosticsUrl(),
          },
          {
            name: "Why is the app API error rate over 50%",
            to: diagnosticsDetailUrl(),
          },
        ]}
      />

      <DetailHeader>
        <div className="flex justify-between items-center">
          <Group size="sm" variant="horizontal" className="items-center">
            <img
              className="w-[32px] h-[32px]"
              alt="Stack icon"
              src="/resource-types/logo-diagnostics.png"
            />
            <h1 className="text-lg text-gray-500">Diagnostics Details</h1>
          </Group>
          <ButtonDestroy
            size="sm"
            className="semibold"
            variant="delete"
            requireConfirm
          >
            Delete
          </ButtonDestroy>
        </div>

        <DetailInfoGrid columns={2}>
          <DetailInfoItem title="App">
            <Link to="/apps/85039/services" className="flex">
              app-ui
            </Link>
          </DetailInfoItem>
          <DetailInfoItem title="Created Date">
            2024-11-16 02:34:18 UTC
          </DetailInfoItem>
          <DetailInfoItem title="Environment">
            <Link to="/environments/10673/apps" className="flex">
              dashboard
            </Link>
          </DetailInfoItem>
          <DetailInfoItem title="Start Time">
            2024-11-16 01:11:00 UTC
          </DetailInfoItem>
          <DetailInfoItem title="Symptoms">
            Why is the app API error rate over 50%
          </DetailInfoItem>
          <DetailInfoItem title="End Time">
            2024-11-16 02:11:00 UTC
          </DetailInfoItem>
        </DetailInfoGrid>
      </DetailHeader>

      <div className="flex flex-col gap-4">
        {/*Widget Starts Here*/}
        <div className="bg-white shadow rounded-lg border border-black-100 relative min-h-[100px] max-h-[460px] overflow-hidden">
          <div className="flex justify-between items-center gap-2 py-3 px-4 bg-black-50">
            <Group size="sm" variant="horizontal" className="items-center">
              <img
                src="/resource-types/logo-datadog.png"
                className="w-[20px] h-[20px] mr-1 align-middle"
                aria-label="App"
              />
              <p className="font-semibold pb-1">Chart Label</p>
            </Group>
            <Group size="sm" variant="horizontal" className="items-center">
              <Tooltip text="Helpful" placement="bottom" fluid>
                <ButtonIcon
                  icon={<IconThumbsUp variant="sm" />}
                  size="xs"
                  variant="white"
                  className="!bg-black-50 hover:!bg-black-100 !shadow-none"
                />
              </Tooltip>
              <Tooltip text="Unhelpful" placement="bottom" fluid>
                <ButtonIcon
                  icon={<IconThumbsUp variant="sm" className="rotate-180" />}
                  size="xs"
                  variant="white"
                  className="!bg-black-50 hover:!bg-black-100 !shadow-none"
                />
              </Tooltip>
              <Tooltip text="View Source" placement="bottom" fluid>
                <ButtonIcon
                  icon={<IconExternalLink variant="sm" />}
                  size="xs"
                  variant="white"
                  className="!bg-black-50 hover:!bg-black-100 !shadow-none"
                >
                  View
                </ButtonIcon>
              </Tooltip>
            </Group>
          </div>
          <div className="p-4">
            <div className="border border-black-100 rounded-md px-3 p-2 flex items-center">
              <IconAI className="inline-block mr-2 shrink-0" />
              The CPU usage increased just before the error rate increased.
            </div>
          </div>
        </div>
        {/*Widget Ends Here*/}
      </div>
    </AppSidebarLayout>
  );
};
