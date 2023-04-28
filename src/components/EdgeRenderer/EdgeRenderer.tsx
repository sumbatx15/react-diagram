import { FC } from "react";
import { EdgeContainer } from "../Diagram/edge";
import { EdgeTypes } from "../../types";
import { DefaultEdge } from "../Edge/DefaultEdge";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

export const EdgeRenderer: FC<{ edgeTypes: EdgeTypes }> = ({ edgeTypes }) => {
  const useDiagram = useGetDiagramStore();
  
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
