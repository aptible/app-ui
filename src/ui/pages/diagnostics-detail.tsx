import { diagnosticsDetailUrl, diagnosticsUrl } from "@app/routes";
import { AppSidebarLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  FormGroup,
  Group,
  Input,
  Radio,
  RadioGroup,
  TextArea,
  TitleBar,
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

      <div className="flex flex-col gap-4">
        {/*Widget*/}
        <div className="bg-white shadow rounded-lg border border-black-100 relative min-h-[100px] max-h-[460px] overflow-hidden">
          <div className="flex items-center gap-2 py-3 px-4 bg-black-50">
            <img
              src="/resource-types/logo-datadog.png"
              className="w-[20px] h-[20px] mr-1 align-middle"
              aria-label="App"
            />
            <p className="font-semibold pb-1">Chart Label</p>
          </div>
        </div>
        {/*Widget*/}
        <div className="bg-white shadow rounded-lg border border-black-100 relative min-h-[100px] max-h-[460px] overflow-hidden">
          <div className="flex items-center gap-2 py-3 px-4 bg-black-50">
            <img
              src="/resource-types/logo-datadog.png"
              className="w-[20px] h-[20px] mr-1 align-middle"
              aria-label="App"
            />
            <p className="font-semibold pb-1">Chart Label</p>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
};
