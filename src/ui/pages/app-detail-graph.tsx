import {
  fetchApp,
  fetchConfiguration,
  selectAppById,
  selectDepGraphDatabases,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { appDetailUrl, databaseDetailUrl } from "@app/routes";
import cytoscape from "cytoscape";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  Banner,
  Box,
  CytoscapeGraph,
  GraphFitButton,
  Group,
  PermissionGate,
  graphPadding,
} from "../shared";

export const AppDetailGraphPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const dbs = useSelector((s) => selectDepGraphDatabases(s, { id: app.id }));
  const [cy, setCy] = useState<cytoscape.Core>();
  const [selected, setSelected] = useState<cytoscape.NodeSingular>();

  const appNode: cytoscape.NodeDefinition = {
    data: {
      id: `${app.environmentId}-${app.id}`,
      resourceType: "app",
      resourceId: app.id,
      label: app.handle,
      url: appDetailUrl(app.id),
    },
    classes: ["app", "healthy"],
  };

  const dbNodes: cytoscape.NodeDefinition[] = dbs.map((db) => ({
    data: {
      id: `${db.environmentId}-${db.id}`,
      resourceType: "database",
      resourceId: db.id,
      label: db.handle,
      url: databaseDetailUrl(db.id),
      reason: db.why.key,
    },
    classes: ["database", "healthy"],
  }));

  const edges: cytoscape.EdgeDefinition[] = dbNodes.map((dbNode) => ({
    data: {
      source: appNode.data.id || "",
      target: dbNode.data.id || "",
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
    cy.add(dbNodes);
    cy.add(edges);

    // Layout has to be created after nodes are added
    cy.layout({
      name: "klay",
      animate: false,
      nodeDimensionsIncludeLabels: true,
      padding: graphPadding,
    } as any).run();
  }, [cy, app, dbs]);

  return (
    <PermissionGate scope="read" envId={app.environmentId}>
      <Group className="grow">
        <Banner variant="info">
          BETA - Dependencies are database connections derived from
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
                    <b>Reason:</b> {selected.data("reason")}
                  </div>
                ) : null}
                <Link to={selected.data("url")}>Details</Link>
              </Group>
            </Box>
          )}

          <Group className="flex-col-reverse absolute right-4 bottom-4">
            <GraphFitButton cy={cy} />
          </Group>
        </CytoscapeGraph>
      </Group>
    </PermissionGate>
  );
};
