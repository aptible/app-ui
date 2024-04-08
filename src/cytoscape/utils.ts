import cytoscape from "cytoscape";

// Removes a parent node while leaving its children
export const removeParentNode = (nodes: cytoscape.NodeCollection) => {
  nodes.each((node) => {
    node.children().move({ parent: node.parent()[0]?.id() })
  });
  nodes.remove();
}
