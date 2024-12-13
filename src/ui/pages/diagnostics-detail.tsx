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
  ButtonLink,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailTitleBar,
  FormGroup,
  FormGroupFeedback,
  Group,
  IconAI,
  IconExternalLink,
  IconThumbsUp,
  Input,
  Radio,
  RadioGroup,
  Select,
  TextArea,
  TitleBar,
  Tooltip,
  tokens,
} from "../shared";

const selectOption = (option: SelectOption) => {
  setChoice(option.value);
};
const options: SelectOption[] = Array(8)
  .fill(0)
  .map((_, idx) => ({
    label: "Select",
    value: "Select",
  }));
const selectedOption = [].find(
  (option: SelectOption) => option.value === choice,
);

export const DiagnosticsDetailPage = () => {
  return (
    <AppSidebarLayout>
      <Breadcrumbs
        crumbs={[
          {
            name: "app-ui",
            to: "/apps/85039/services",
          },
          {
            name: "2024-12-01 10:11:00 - 10:21:00 UTC",
            to: diagnosticsDetailUrl(),
          },
        ]}
      />

      <DetailHeader>
        <DetailTitleBar
          title="Diagnostics Details"
          icon={
            <img
              src="/resource-types/logo-diagnostics.png"
              className="w-[32px] h-[32px] mr-3"
              aria-label="App"
            />
          }
          docsUrl="https://docs.aptible.ai/home"
        />

        <form>
          <div className="flex items-center gap-4">
            <FormGroup
              label="Symptoms"
              htmlFor="Symptoms"
              feedbackVariant="info"
              className="flex-1"
            >
              <Select
                onSelect={selectOption}
                value={selectedOption}
                options={options}
              />
            </FormGroup>
            <FormGroup
              label="Time Range"
              htmlFor="Time Range"
              feedbackVariant="info"
              className="flex-1"
            >
              <Select
                onSelect={selectOption}
                value={selectedOption}
                options={options}
              />
            </FormGroup>
          </div>
          <div className="mt-4">
            <hr />
            <div className="flex justify-between items-end gap-2">
              <div className="flex items-center gap-2 mt-4">
                <ButtonLink
                  to={diagnosticsDetailUrl()}
                  className="w-[200px] flex font-semibold"
                >
                  Generate Diagnostics
                </ButtonLink>
                <Button
                  className="w-fit ml-2 flex font-semibold"
                  variant="white"
                >
                  Cancel
                </Button>
              </div>
              <ButtonDestroy
                className="semibold"
                variant="delete"
                requireConfirm
              >
                Delete
              </ButtonDestroy>
            </div>
          </div>
        </form>
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
              <p className="font-semibold pb-1">CPU Usage</p>
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
            <div className="border border-black-100 rounded-md px-3 p-2 flex items-center mb-4">
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
