import { useSelector, useDispatch } from "@app/react";
import { serviceCatalogUrl } from "@app/routes";
import * as utils from "@app/deploy/custom-resource";
import { schema } from "@app/schema";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { AppSidebarLayout } from "../layouts/app-sidebar-layout";
import { Box } from "../shared/box";
import { Table } from "../shared/table";
import { DetailPageHeaderView } from "../shared/detail-page-header-view";
import { DeployCustomResource } from "@app/types";
// Create a custom tabs component for our service catalog
const ServiceCatalogTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const handleClick = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <nav className="flex space-x-8 bg-white border-black-100 border-b" aria-label="Tabs">
      <a 
        href="#table"
        onClick={handleClick('table')}
        className={`flex items-center whitespace-nowrap pb-3 px-1 border-b-3 hover:no-underline ${
          activeTab === 'table' 
            ? 'font-semibold text-black border-orange-400' 
            : 'font-normal text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
        }`}
      >
        Table View
      </a>
      <a 
        href="#diagram"
        onClick={handleClick('diagram')}
        className={`flex items-center whitespace-nowrap pb-3 px-1 border-b-3 hover:no-underline ${
          activeTab === 'diagram' 
            ? 'font-semibold text-black border-orange-400' 
            : 'font-normal text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
        }`}
      >
        Diagram View
      </a>
    </nav>
  );
};

function CustomResourcesTable() {
  const customResources = useSelector(
    (s) => Object.values(s.customResources?.value || {}),
  );

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Type",
        accessor: "resourceType",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Created",
        accessor: (row: DeployCustomResource) => {
          return new Date(row.createdAt).toLocaleDateString();
        },
      },
    ],
    [],
  );

  const data = useMemo(() => customResources, [customResources]);

  return (
    <Box className="p-4 bg-white rounded shadow">
      <Table columns={columns} data={data} />
    </Box>
  );
}

function ResourceNode({ data }: { data: { label: string; type: string } }) {
  const getColorForType = (type: string) => {
    switch (type) {
      case "database":
        return "bg-blue-100 border-blue-500";
      case "app":
        return "bg-green-100 border-green-500";
      case "service":
        return "bg-purple-100 border-purple-500";
      default:
        return "bg-gray-100 border-gray-500";
    }
  };

  return (
    <div
      className={`px-4 py-2 rounded-md border ${getColorForType(
        data.type,
      )} min-w-[150px] font-medium`}
    >
      {data.label}
    </div>
  );
}

function CustomResourcesDiagram() {
  const customResources = useSelector(
    (s) => Object.values(s.customResources?.value || {}),
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const nodePositions: Record<string, { x: number; y: number }> = {};

    // Place nodes in a grid layout
    const nodesPerRow = 3;
    const nodeWidth = 200;
    const nodeHeight = 120;

    customResources.forEach((resource, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      const xPos = col * nodeWidth + 50;
      const yPos = row * nodeHeight + 50;
      
      nodePositions[resource.id] = { x: xPos, y: yPos };
      
      newNodes.push({
        id: resource.id,
        type: "resource",
        position: { x: xPos, y: yPos },
        data: { 
          label: resource.name,
          type: resource.resourceType,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    });

    // Create connections based on relationships in metadata
    customResources.forEach((resource) => {
      if (resource.metadata?.connections) {
        const connections = resource.metadata.connections as string[];
        connections.forEach((targetId) => {
          if (nodePositions[targetId]) {
            newEdges.push({
              id: `${resource.id}-${targetId}`,
              source: resource.id,
              target: targetId,
              animated: true,
            });
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [customResources, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ resource: ResourceNode }), []);

  return (
    <Box className="h-[600px] bg-white rounded shadow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
}

export function ServiceCatalogPage() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(utils.fetchCustomResources());
  }, [dispatch]);

  const [activeTab, setActiveTab] = useState("table");

  // Set initial tab based on URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'diagram' || hash === 'table') {
      setActiveTab(hash);
    }
  }, []);

  return (
    <AppSidebarLayout>
      <DetailPageHeaderView
        title="Service Catalog"
        description="View and manage custom resources in your organization"
        breadcrumbs={[
          { label: "Home", url: "/" },
          { label: "Service Catalog", url: serviceCatalogUrl() },
        ]}
      />

      <Box className="mb-6">
        <ServiceCatalogTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </Box>

      {activeTab === "table" ? (
        <CustomResourcesTable />
      ) : (
        <CustomResourcesDiagram />
      )}
    </AppSidebarLayout>
  );
}