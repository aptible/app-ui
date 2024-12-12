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

      <Box>dsfad</Box>
    </AppSidebarLayout>
  );
};
