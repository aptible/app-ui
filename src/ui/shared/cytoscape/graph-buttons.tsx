import cytoscape from "cytoscape";
import {
  ButtonIcon,
  ButtonIconProps,
  IconFit,
  IconTarget,
  graphPadding,
} from "..";

type CytoscapeClient = cytoscape.Core | null | undefined;
type GraphButtonProps = Optional<ButtonIconProps, "icon"> & {
  cy: CytoscapeClient;
};

export const fitGraph = (cy: CytoscapeClient) =>
  cy?.animate({ fit: { padding: graphPadding } as any });
export const GraphFitButton = ({
  icon = <IconFit variant="sm" />,
  onClick = () => {
    fitGraph(cy);
  },
  cy,
  ...props
}: GraphButtonProps) => <ButtonIcon icon={icon} onClick={onClick} {...props} />;

export const fitSelection = (cy: CytoscapeClient) => {
  const selection = cy?.nodes(":selected");

  cy?.animate({
    fit: {
      eles: selection as cytoscape.NodeCollection,
      padding: graphPadding,
    },
  });
};

export const focusSelection = (cy: CytoscapeClient) => {
  if (cy == null) {
    return;
  }

  const selection = cy.nodes(":selected");

  // If multiple nodes or a parent node are selected, fit instead of center
  if (selection.length > 1 || selection.nodes(":parent").length) {
    fitSelection(cy);
    return;
  }

  cy.animate({
    center: {
      eles: selection as cytoscape.NodeCollection,
    },
    zoom: 1.5,
  });
};
export const GraphFocusButton = ({
  icon = <IconTarget variant="sm" />,
  onClick = () => {
    focusSelection(cy);
  },
  cy,
  ...props
}: GraphButtonProps) => <ButtonIcon icon={icon} onClick={onClick} {...props} />;
