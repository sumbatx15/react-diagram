import { FC, memo } from "react";
import { shallow } from "zustand/shallow";
import { EdgeTypes } from "../../types";
import { DraggedEdge, EdgeContainer } from "../Diagram/edge";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";
import { DefaultEdge } from "../Edge/DefaultEdge";

export const ElevatedEdgeRenderer: FC<
  { edgeTypes?: EdgeTypes } & React.SVGProps<SVGSVGElement>
> = memo(({ edgeTypes, ...svgProps }) => {
  const useDiagram = useGetDiagramStore();

  const edges = useDiagram(
    (state) => state.getEdgesByElevation().elevated,
    shallow
  );
  return (
    <EdgeContainer {...svgProps}>
      <DraggedEdge />
      {edges.map((edge) => {
        const types = edgeTypes || {};
        const Component =
          types[edge.type || ""] || types["default"] || DefaultEdge;
        return <Component key={edge.id} {...edge} />;
      })}
    </EdgeContainer>
  );
});
