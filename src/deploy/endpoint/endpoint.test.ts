// @vitest-environment node

import { createId } from "@app/mocks";
import { defaultDeployEndpoint } from "@app/schema";
import {
  getEndpointDisplayHost,
  getEndpointUrl,
  parsePortsStrToNum,
} from "./index";

describe("parsePortsStrToNum", () => {
  describe("when parsing comma-separated ports", () => {
    it("should convert to number array", () => {
      expect(parsePortsStrToNum("8080,9000,3000")).toEqual([8080, 9000, 3000]);
    });
  });

  describe("when parsing space-separated ports", () => {
    it("should convert to number array", () => {
      expect(parsePortsStrToNum("8080 9000 3000")).toEqual([8080, 9000, 3000]);
    });
  });

  describe("when handling empty strings", () => {
    it("should return empty array", () => {
      expect(parsePortsStrToNum("")).toEqual([]);
    });
  });

  describe("when filtering empty items", () => {
    it("should ignore empty items", () => {
      expect(parsePortsStrToNum("8080,,9000")).toEqual([8080, 9000]);
    });
  });
});

describe("getDisplayHost", () => {
  describe("when no endpoint is provided", () => {
    it("should return `New Endpoint`", () => {
      expect(getEndpointDisplayHost()).toEqual("New Endpoint");
    });
  });

  describe("when endpoint is empty", () => {
    it("should return `New Endpoint`", () => {
      const enp = defaultDeployEndpoint();
      expect(getEndpointDisplayHost(enp)).toEqual("New Endpoint");
    });
  });

  describe("when endpoint is provisioning", () => {
    it("should return `Provisioning`", () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        status: "provisioning",
      });
      expect(getEndpointDisplayHost(enp)).toEqual("Provisioning");
    });
  });

  describe("when endpoint is default", () => {
    it("should return virtual domain", () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        default: true,
        virtualDomain: "virtual.aptible",
        externalHost: "external.aptible",
      });
      expect(getEndpointDisplayHost(enp)).toEqual("virtual.aptible");
    });
  });

  describe("when endpoint is *not* default", () => {
    it("should return external host", () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        default: false,
        virtualDomain: "virtual.aptible",
        externalHost: "external.aptible",
      });
      expect(getEndpointDisplayHost(enp)).toEqual("external.aptible");
    });
  });
});

describe("getEndpointUrl", () => {
  describe("when no endpoint is provided", () => {
    it("should return `New Endpoint`", () => {
      expect(getEndpointUrl()).toEqual("New Endpoint");
    });
  });

  describe("when endpoint is empty", () => {
    it("should return `New Endpoint`", () => {
      const enp = defaultDeployEndpoint();
      expect(getEndpointUrl(enp)).toEqual("New Endpoint");
    });
  });
  describe("for type `http`", () => {
    it("should return virtual domain", () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        virtualDomain: "virtual.aptible",
        externalHost: "",
      });
      expect(getEndpointUrl(enp)).toEqual("virtual.aptible");
    });
  });

  describe("for type `http_proxy_protocol`", () => {
    it("should return virtual domain", () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        virtualDomain: "virtual.aptible",
        externalHost: "",
      });
      expect(getEndpointUrl(enp)).toEqual("virtual.aptible");
    });
  });

  describe("for type `tcp`", () => {
    it("should return external host", () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        virtualDomain: "",
        externalHost: "external.aptible",
      });
      expect(getEndpointUrl(enp)).toEqual("external.aptible");
    });
  });

  describe("for type `tls`", () => {
    it("should return virtual domain", () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        virtualDomain: "",
        externalHost: "external.aptible",
      });
      expect(getEndpointUrl(enp)).toEqual("external.aptible");
    });
  });
});
