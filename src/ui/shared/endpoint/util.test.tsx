import { createId } from "@app/mocks";
import { defaultDeployEndpoint } from "@app/schema";
import { render, screen } from "@testing-library/react";
import { EndpointUrl } from ".";

describe("EndpointUrl", () => {
  describe("when tcp endpoint", () => {
    it("should not include a link", async () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        type: "tcp",
        virtualDomain: "virtual.aptible",
      });
      render(<EndpointUrl enp={enp} />);
      const el = screen.queryByRole("link");
      expect(el).not.toBeInTheDocument();
      expect(screen.queryByText(/virtual.aptible/)).toBeInTheDocument();
    });
  });

  describe("when http endpoint", () => {
    it("should include a link and https protocol", async () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        type: "http",
        externalHost: "external.aptible",
      });
      render(<EndpointUrl enp={enp} />);
      const el = screen.queryByRole("link");
      expect(el).toBeInTheDocument();
      expect(el?.getAttribute("href")).toEqual("https://external.aptible");
      expect(screen.queryByText(/external.aptible/)).toBeInTheDocument();
    });
  });

  describe("when http_proxy_protocol endpoint", () => {
    it("should include a link and https protocol", async () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        type: "http_proxy_protocol",
        externalHost: "external.aptible",
      });
      render(<EndpointUrl enp={enp} />);
      const el = screen.queryByRole("link");
      expect(el).toBeInTheDocument();
      expect(el?.getAttribute("href")).toEqual("https://external.aptible");
      expect(screen.queryByText(/external.aptible/)).toBeInTheDocument();
    });
  });

  describe("when wildcard endpoint", () => {
    it("should not include a link", async () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        type: "http",
        virtualDomain: "*.aptible.com",
      });
      render(<EndpointUrl enp={enp} />);
      const el = screen.queryByRole("link");
      expect(el).not.toBeInTheDocument();
      expect(screen.queryByText("*.aptible.com")).toBeInTheDocument();
    });
  });

  describe("when tls endpoint", () => {
    it("should include a link and https protocol", async () => {
      const enp = defaultDeployEndpoint({
        id: `${createId()}`,
        type: "tls",
        externalHost: "external.aptible",
      });
      render(<EndpointUrl enp={enp} />);
      const el = screen.queryByRole("link");
      expect(el).toBeInTheDocument();
      expect(el?.getAttribute("href")).toEqual("https://external.aptible");
      expect(screen.queryByText(/external.aptible/)).toBeInTheDocument();
    });
  });
});
