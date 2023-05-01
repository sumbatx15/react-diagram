import { FC, memo } from "react";
import { shallow } from "zustand/shallow";
import { EdgeTypes } from "../../types";
import { DraggedEdge, EdgeContainer } from "../Diagram/edge";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";
import { DefaultEdge } from "../Edge/DefaultEdge";

export const ElevatedEdgeRenderer: FC<
  { edgeTypes: EdgeTypes } & React.SVGProps<SVGSVGElement>
> = memo(({ edgeTypes, ...svgProps }) => {
  const useDiagram = useGetDiagramStore();

  const edges = useDiagram(
    (state) => state.getEdgesByElevation().elevated,
    shallow
  );
  console.log("edges:", edges);
  return (
    <EdgeContainer {...svgProps}>
      <DraggedEdge />
      {edges.map((edge) => {
        const Component =
          edgeTypes[edge.type || ""] || edgeTypes["default"] || DefaultEdge;
        return <Component key={edge.id} {...edge} />;
      })}
    </EdgeContainer>
  );
});
