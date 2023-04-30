import { FC } from "react";
import { shallow } from "zustand/shallow";
import { EdgeTypes } from "../../types";
import { DraggedEdge, EdgeContainer } from "../Diagram/edge";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";
import { DefaultEdge } from "../Edge/DefaultEdge";

export const ElevatedEdgeRenderer: FC<{ edgeTypes: EdgeTypes }> = ({
  edgeTypes,
}) => {
  const useDiagram = useGetDiagramStore();

  const edges = useDiagram(
    (state) => state.getEdgesByElevation().elevated,
    shallow
  );
  return (
    <EdgeContainer>
      <DraggedEdge />
      {edges.map((edge) => {
        const Component =
          edgeTypes[edge.type || ""] || edgeTypes["default"] || DefaultEdge;
        return <Component key={edge.id} {...edge} />;
      })}
    </EdgeContainer>
  );
};
