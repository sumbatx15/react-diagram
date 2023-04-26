import { FC } from "react";
import { EdgeContainer } from "../Diagram/edge";
import { EdgeTypes } from "../../types";
import { useDiagram } from "../../store/diagramStore";
import { DefaultEdge } from "../Edge/DefaultEdge";

export const EdgeRenderer: FC<{ edgeTypes: EdgeTypes }> = ({ edgeTypes }) => {
  const edges = useDiagram((state) => state.edges);
  return (
    <EdgeContainer>
      {edges.map((edge) => {
        const Component =
          edgeTypes[edge.type || ""] || edgeTypes["default"] || DefaultEdge;
        return <Component key={edge.id} {...edge} />;
      })}
    </EdgeContainer>
  );
};
