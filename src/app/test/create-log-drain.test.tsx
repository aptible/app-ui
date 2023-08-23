import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { hasDeployEnvironment, selectEnvironmentById } from "@app/deploy";
import {
  server,
  stacksWithResources,
  testAccount,
  verifiedUserHandlers,
} from "@app/mocks";
import { createLogDrainUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";

describe("Create Log Drain flow", () => {
  it("should create datadog log drain", async () => {});
  it("should create papertrail log drain", async () => {});
  it("should create elasticsearch_database log drain", async () => {});
  it("should create sumologic log drain", async () => {});
  it("should create https_post log drain", async () => {});
  it("should create syslog_tls_tcp log drain", async () => {});
  it("should create insightops log drain", async () => {});
});
