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
          <FormGroup
            label="Time Range"
            htmlFor="Time Range"
            feedbackVariant="info"
            className="mb-4"
          >
            <Select
              onSelect={selectOption}
              value={selectedOption}
              options={options}
            />
            <FormGroupFeedback>
              How long has this issue been occuring?
            </FormGroupFeedback>
          </FormGroup>
          {/*          <FormGroup
            label="Custom Start Time"
            htmlFor="Custom Start Time"
            feedbackVariant="info"
            className="mb-4"
          >
            <div className="flex items-center gap-2">
              <Select
                onSelect={selectOption}
                value={selectedOption}
                options={options}
              />
              <Input
                className="h-[37px] w-[45px] pr-0"
                name="app-handle"
                type="text"
                onChange={(e) => setFormInput(e.currentTarget.value)}
                autoComplete="name"
                data-testid="input-name"
                id="input-name"
                placeholder="HH"
              />
              <Input
                className="h-[37px] w-[48px]  pr-0"
                name="app-handle"
                type="text"
                onChange={(e) => setFormInput(e.currentTarget.value)}
                autoComplete="name"
                data-testid="input-name"
                id="input-name"
                placeholder="MM"
              />
              <p>UTC</p>
            </div>
          </FormGroup>
          <FormGroup
            label="Custom End Time"
            htmlFor="Custom End Time"
            feedbackVariant="info"
            className="mb-4"
          >
            <div className="flex items-center gap-2">
              <Select
                onSelect={selectOption}
                value={selectedOption}
                options={options}
              />
              <Input
                className="h-[37px] w-[45px] pr-0"
                name="app-handle"
                type="text"
                onChange={(e) => setFormInput(e.currentTarget.value)}
                autoComplete="name"
                data-testid="input-name"
                id="input-name"
                placeholder="HH"
              />
              <Input
                className="h-[37px] w-[48px]  pr-0"
                name="app-handle"
                type="text"
                onChange={(e) => setFormInput(e.currentTarget.value)}
                autoComplete="name"
                data-testid="input-name"
                id="input-name"
                placeholder="MM"
              />
              <p>UTC</p>
            </div>
          </FormGroup>*/}
          <FormGroup label="Symptoms" htmlFor="Symptoms" feedbackVariant="info">
            <Select
              onSelect={selectOption}
              value={selectedOption}
              options={options}
            />
            <FormGroupFeedback>
              A short description of issues (e.g., "my application is suddenly
              returning a lot of 500 errors")
            </FormGroupFeedback>
            <TextArea
              className={`${tokens.type.textarea} mt-2`}
              defaultValue="Why is the app API error rate over 50%"
            />
            <div className="mt-4">
              <hr />
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
          </FormGroup>
        </form>
      </Box>
    </AppSidebarLayout>
  );
};
