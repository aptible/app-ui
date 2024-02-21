import {
  DeployCodeScanResponse,
  fetchApp,
  fetchConfiguration,
  hasDeployOperation,
  selectAppById,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { capitalize } from "@app/string-utils";
import { useParams } from "react-router";
import { useLatestCodeResults } from "../hooks";
import {
  AppConfigView,
  BannerMessages,
  Box,
  ButtonLinkDocs,
  Code,
  EnvEditor,
  Group,
  Loading,
  PreText,
  tokens,
} from "../shared";

const CodeScanInfo = ({ appId }: { appId: string }) => {
  const { codeScan, op } = useLatestCodeResults(appId);
  if (!hasDeployOperation(op)) {
    return (
      <div>
        Code scan information is only available for <Code>git push</Code>{" "}
        deployments.
      </div>
    );
  }

  if (codeScan.isInitialLoading) {
    return <Loading />;
  }

  if (codeScan.isError) {
    return <BannerMessages {...codeScan} />;
  }

  if (!codeScan.data) {
    return <div>No data found</div>;
  }

  return (
    <Box>
      <Group size="sm">
        <h3 className={tokens.type.h3}>Code Scan</h3>
        <CodeScanView codeScan={codeScan.data} />
      </Group>
    </Box>
  );
};

const CodeScanView = ({ codeScan }: { codeScan: DeployCodeScanResponse }) => {
  return (
    <Group>
      <div>
        <div className={tokens.type.h4}>Languages Detected</div>
        <div>{capitalize(codeScan.languages_detected?.join(", ") || "")}</div>
      </div>

      <div>
        <div className={tokens.type.h4}>Procfile</div>
        <div>
          {codeScan.procfile_present ? (
            <PreText text={codeScan.procfile_data || ""} />
          ) : (
            "No"
          )}
        </div>
      </div>

      <div>
        <div className={tokens.type.h4}>
          <Code>.aptible.yml</Code>
        </div>
        <div>
          {codeScan.aptible_yml_present ? (
            <PreText text={codeScan.aptible_yml_data || ""} />
          ) : (
            "No"
          )}
        </div>
      </div>

      <div>
        <div className={tokens.type.h4}>Dockerfile</div>
        <div className="relative">
          {codeScan.dockerfile_present ? (
            <PreText text={codeScan.dockerfile_data || ""} />
          ) : (
            "No"
          )}
        </div>
      </div>
    </Group>
  );
};

export const AppDetailConfigPage = () => {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchApp({ id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));

  return (
    <Group>
      <Box>
        <Group size="sm">
          <h3 className={tokens.type.h3}>Current Environment Variables</h3>
          <AppConfigView
            configId={app.currentConfigurationId}
            envId={app.environmentId}
          />
        </Group>
      </Box>

      <Box>
        <Group size="sm">
          <div className="flex items-center justify-between">
            <h3 className={tokens.type.h3}>Edit Environment Variables</h3>
            <ButtonLinkDocs href="https://www.aptible.com/docs/configuration" />
          </div>

          <EnvEditor app={app} />
        </Group>
      </Box>

      <CodeScanInfo appId={app.id} />
    </Group>
  );
};
