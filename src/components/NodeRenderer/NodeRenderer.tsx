import { FC } from "react";
import { NodeTypes } from "../../types";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";
import { WrappedNode } from "../Diagram/WrappedNode";
import { DefaultNode } from "../Node/DefaultNode";
import { DiagramProps } from "../Diagram/Diagram";

export const NodeRenderer: FC<{
  nodeTypes?: NodeTypes;
  nodeIds?: string[];
}> = ({ nodeTypes, nodeIds: _nodeIds }) => {
  const useDiagram = useGetDiagramStore();
  const nodeIds = _nodeIds || useDiagram.getState().nodeIds;

  return (
    <>
      {nodeIds.map((id) => {
        const types = nodeTypes || {};
        const Component =
          types[useDiagram.getState().nodeTypes[id]] ||
          types["default"] ||
          DefaultNode;
        return <WrappedNode nodeId={id} key={id} Component={Component} />;
      })}
    </>
  );
};
