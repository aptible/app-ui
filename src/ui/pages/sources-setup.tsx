import { fetchApps, selectAppsAsList } from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { appCiCdUrl } from "@app/routes";
import { AppSidebarLayout } from "@app/ui";
import {
  Banner,
  Box,
  Button,
  FormGroup,
  Group,
  Select,
  SelectOption,
  TitleBar,
  tokens,
} from "@app/ui/shared";
import { useState } from "react";
import { Link } from "react-router-dom";

export function SourcesSetupPage() {
  const { isLoading } = useQuery(fetchApps());
  const apps = useSelector(selectAppsAsList);
  const options: SelectOption[] = [
    {
      label: isLoading ? "Please wait..." : "Select an app",
      value: "",
      disabled: isLoading,
    },
    ...(apps || [])
      .map((a) => ({
        label: a.handle,
        value: a.id,
        disabled: !!a.currentSourceId,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const onAppSelect = (option: SelectOption) => setSelectedAppId(option.value);

  return (
    <AppSidebarLayout>
      <Group>
        <Group size="sm">
          <TitleBar description="Sources connect apps with code repositories to show you what's deployed where.">
            Sources
          </TitleBar>
        </Group>
      </Group>
      <Box>
        <Banner variant="info" className="mb-6">
          Sources connect apps with code repositories to show you what's
          deployed where.{" "}
          <Link
            target="_blank"
            to="https://www.loom.com/share/cb781fd9aa2e41198684e99f25d4ea2a"
          >
            Watch the demo video.
          </Link>
        </Banner>
        <Group className="mb-4">
          <h3 className={tokens.type.h3}>How to Setup a Source</h3>

          <h4 className="font-semibold">
            Step 1. View an app’s CI/CD tab and follow the setup instructions.
          </h4>
          <p>
            Aptible automatically creates a source and links all releases to
            that source when you use the Aptible GitHub Action (v4 or greater).
          </p>

          <h4 className="font-semibold">
            Step 2. Commit your changes and wait for the release to finish.
          </h4>
          <p>
            That’s it! Now you can view all apps, release history, release logs,
            and release ENV variables (if you have permissions) tied to this
            source.
          </p>
        </Group>
        <Group>
          <FormGroup
            label="Choose App to configure Source"
            htmlFor="Choose App to configure Source"
          >
            <Select
              disabled={isLoading}
              onSelect={onAppSelect}
              value={selectedAppId || undefined}
              options={options}
            />
          </FormGroup>
          <Link to={selectedAppId ? appCiCdUrl(selectedAppId) : "#"}>
            <Button className="w-fit" type="button" disabled={!selectedAppId}>
              Continue to CI/CD Setup
            </Button>
          </Link>
        </Group>
      </Box>
    </AppSidebarLayout>
  );
}
