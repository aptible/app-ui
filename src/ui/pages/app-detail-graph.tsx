import {
  fetchApp,
  fetchConfiguration,
  selectAppById,
  selectDependencies,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { appDetailUrl, databaseDetailUrl, resourceGraphUrl } from "@app/routes";
import cytoscape from "cytoscape";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  Banner,
  Box,
  ButtonLink,
  Code,
  CytoscapeGraph,
  GraphFitButton,
  Group,
  IconExternalLink,
  PermissionGate,
  graphPadding,
} from "../shared";

export const AppDetailGraphPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const depNodes = useSelector((s) => selectDependencies(s, { id: app.id }));
  const [cy, setCy] = useState<cytoscape.Core>();
  const [selected, setSelected] = useState<cytoscape.NodeSingular>();

  const appNode: cytoscape.NodeDefinition = {
    data: {
      id: `app-${app.id}`,
      resourceType: "app",
      resourceId: app.id,
      label: app.handle,
      url: appDetailUrl(app.id),
    },
    classes: ["app", "healthy"],
  };

  const graphNodes: cytoscape.NodeDefinition[] = depNodes.map((dep) => ({
    data: {
      id: `${dep.type}-${dep.refId}`,
      resourceType: dep.type,
      resourceId: dep.refId,
      label: dep.name,
      url:
        dep.type === "app"
          ? appDetailUrl(dep.refId)
          : databaseDetailUrl(dep.refId),
      reason: dep.why,
    },
    classes: [dep.type, "healthy"],
  }));

  const edges: cytoscape.EdgeDefinition[] = graphNodes.map((depNode) => ({
    data: {
      source: appNode.data.id || "",
      target: depNode.data.id || "",
      label: depNode.data.reason,
    },
  }));

  useEffect(() => {
    if (cy == null) {
      return;
    }

    console.log("Initializing");

    cy.on("select", "node", (e) => {
      setSelected(e.target);
      // e.cy.animate({
      //   center: {
      //     eles: e.target,
      //   },
      // });
    });

    cy.on("unselect", () => {
      setSelected(undefined);
    });

    return () => {
      console.log("Cleaning up");
      cy.destroy();
    };
  }, [cy]);

  useEffect(() => {
    if (cy == null || cy.destroyed()) {
      return;
    }

    cy.remove("*");

    cy.add(appNode);
    cy.add(graphNodes);
    cy.add(edges);

    // Layout has to be created after nodes are added
    cy.layout({
      name: "klay",
      animate: false,
      nodeDimensionsIncludeLabels: true,
      padding: graphPadding,
    } as any).run();
  }, [cy, app, depNodes]);

  return (
    <PermissionGate scope="read" envId={app.environmentId}>
      <Group className="grow">
        <Banner variant="info">
          BETA - Dependencies are connections derived from the App's
          configuration data (environment variables).
        </Banner>
        <CytoscapeGraph className="grow" onClient={setCy}>
          {selected == null ? null : (
            <Box className="absolute right-4 top-4">
              <Group>
                <div>
                  <b>Type:</b> {selected.data("resourceType")}
                </div>
                <div>
                  <b>Name:</b> {selected.data("label")}
                </div>
                {selected.data("reason") ? (
                  <div>
                    <b>Reason:</b> <Code>{selected.data("reason")}</Code>
                  </div>
                ) : null}
                <Link to={selected.data("url")}>Details</Link>
              </Group>
            </Box>
          )}

          <Group className="flex-col-reverse absolute right-4 bottom-4">
            <ButtonLink to={resourceGraphUrl()}>
              <IconExternalLink variant="sm" />
            </ButtonLink>
            <GraphFitButton cy={cy} />
          </Group>
        </CytoscapeGraph>
      </Group>
    </PermissionGate>
  );
};
