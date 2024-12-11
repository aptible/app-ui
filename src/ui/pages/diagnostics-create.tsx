import { diagnosticsCreateUrl, diagnosticsUrl } from "@app/routes";
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

      <Box>dsfad</Box>
    </AppSidebarLayout>
  );
};
