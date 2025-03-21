import { selectAppById } from "@app/deploy";
import { useSelector } from "@app/react";
import { useParams } from "react-router";
import { Banner, Box, Group, PermissionGate, tokens } from "../shared";
import { DiagnosticsCreateForm } from "./diagnostics-create";

export function AppDetailDiagnosticsPage() {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));

  return (
    <PermissionGate scope="read" envId={app.environmentId}>
      <Group>
        <Banner>
          <strong>New Feature:</strong> Use Aptible AI to diagnose production
          issues related to increased errors, latency or availability.
        </Banner>
        <h3 className={tokens.type.h3}>Diagnostics</h3>
        <Box>
          <DiagnosticsCreateForm
            resourceId={id}
            resourceType="App"
            resourceName={app.handle}
          />
        </Box>
      </Group>
    </PermissionGate>
  );
}
