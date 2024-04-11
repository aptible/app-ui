import cytoscape from "cytoscape";
import cise from "cytoscape-cise";
import coseBilkent from "cytoscape-cose-bilkent";
import klay from "cytoscape-klay";
import { useEffect, useRef } from "react";
import colors from "tailwindcss/colors";
import { IconBox, IconCylinder, IconGlobe, IconProps, iconToDataUri } from "..";

cytoscape.use(coseBilkent);
cytoscape.use(cise);
cytoscape.use(klay);

export const graphPadding = 50;

const iconProps: IconProps = {
  color: "#FDF8F0", // off-white
};

const appIconUri = iconToDataUri(<IconBox {...iconProps} />);
const databaseIconUri = iconToDataUri(<IconCylinder {...iconProps} />);
const externalIconUri = iconToDataUri(<IconGlobe {...iconProps} />);

const defautlClassName =
  "relative border border-gray-200 rounded-md shadow-sm bg-[url('/chart-pattern.png')]";
const defaultStyle: cytoscape.Stylesheet[] = [
  // the stylesheet for the graph
  {
    selector: "node",
    style: {
      "background-color": "#666",
      label: "data(label)",
    },
  },

  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#999",
      "line-opacity": 0.4,
      "target-arrow-color": "#000",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
    },
  },

  {
    selector: ":parent",
    style: {
      "background-color": "#eee",
    },
  },

  {
    selector: "node:selected",
    style: {
      "border-style": "solid",
      "border-color": "#111920",
      "border-width": 3,
    },
  },

  {
    selector: ".hidden",
    style: {
      display: "none",
    },
  },

  {
    selector: ".invisible",
    style: {
      visibility: "hidden",
    },
  },

  {
    selector: ".invisible-parent",
    style: {
      "background-opacity": 0,
      "border-opacity": 0,
      "text-opacity": 0,
    },
  },

  // Resource types
  {
    selector: ".app",
    style: {
      "background-image": appIconUri,
    },
  },

  {
    selector: ".database",
    style: {
      "background-image": databaseIconUri,
    },
  },

  {
    selector: ".external",
    style: {
      "background-image": externalIconUri,
    },
  },

  // Node status
  {
    selector: ".healthy",
    style: {
      "background-color": "#00633F", // forest
      // "background-color": colors.lime['200']
    },
  },

  {
    selector: ".concerning",
    style: {
      "background-color": colors.yellow["600"],
      // "background-color": colors.yellow['200']
    },
  },

  {
    selector: ".unhealthy",
    style: {
      "background-color": colors.red["700"],
      // "background-color": colors.red['200']
    },
  },
];

export interface CytoscapeGraphProps
  extends Omit<React.JSX.IntrinsicElements["div"], "ref"> {
  onClient?: ((cy: cytoscape.Core | undefined) => void) | null | undefined;
}

export const CytoscapeGraph = (props: CytoscapeGraphProps) => {
  const { onClient, className, children, ...divProps } = props;
  const cyDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cy = cytoscape({ container: cyDom.current });
    cy.style(defaultStyle);
    onClient?.(cy);

    return () => {
      cy.destroy();
      onClient?.(undefined);
    };
  }, []);

  return (
    <div className={`${defautlClassName} ${className}`} {...divProps}>
      <div ref={cyDom} className="relative w-full h-full" />
      {children}
    </div>
  );
};
