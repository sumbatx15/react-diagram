import { FC, memo } from "react";
import { EdgeContainer } from "../Diagram/edge";
import { EdgeTypes } from "../../types";
import { DefaultEdge } from "../Edge/DefaultEdge";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

export const EdgeRenderer: FC<{ edgeTypes?: EdgeTypes }> = memo(
  ({ edgeTypes }) => {
    const useDiagram = useGetDiagramStore();
    const edges = useDiagram((state) => state.getEdgesByElevation().normal);
    return (
      <EdgeContainer>
        {edges.map((edge) => {
          const types = edgeTypes || {};
          const Component =
            types[edge.type || ""] || types["default"] || DefaultEdge;
          return <Component key={edge.id} {...edge} />;
        })}
      </EdgeContainer>
    );
  }
);
