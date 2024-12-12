import {
  diagnosticsCreateUrl,
  diagnosticsDetailUrl,
  diagnosticsUrl,
} from "@app/routes";
import { AppSidebarLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  ButtonLink,
  ButtonLinkDocs,
  FormGroup,
  FormGroupFeedback,
  Group,
  Input,
  Radio,
  RadioGroup,
  Select,
  TextArea,
  TitleBar,
  hr,
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

export const DiagnosticsCreatePage = () => {
  return (
    <AppSidebarLayout>
      <Breadcrumbs
        crumbs={[
          {
            name: "Diagnostics",
            to: diagnosticsUrl(),
          },
          {
            name: "New Diagnostics",
            to: diagnosticsCreateUrl(),
          },
        ]}
      />

      <Box>
        <Banner className="mb-6">
          <strong>New Feature:</strong> Use Aptible AI to diagnose production
          issues related to increased errors, latency or availability.
        </Banner>
        <h1 className="text-lg text-gray-500 mb-4">Choose App to Diagnose</h1>
        <form>
          <FormGroup
            label="Environment"
            htmlFor="Environment"
            feedbackVariant="info"
            className="mb-4"
          >
            <Select
              onSelect={selectOption}
              value={selectedOption}
              options={options}
            />
          </FormGroup>
          <FormGroup
            label="App"
            htmlFor="App"
            feedbackVariant="info"
            className="mb-4"
          >
            <Select
              onSelect={selectOption}
              value={selectedOption}
              options={options}
            />
          </FormGroup>
          <h1 className="text-lg text-gray-500 pt-2 mb-4">Issue Description</h1>
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
            </div>
          </div>
        </form>
      </Box>
    </AppSidebarLayout>
  );
};
