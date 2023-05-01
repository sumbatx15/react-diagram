import { FC } from "react";
import { NodeTypes } from "../../types";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";
import { WrappedNode } from "../Diagram/WrappedNode";
import { DefaultNode } from "../Node/DefaultNode";

export const NodeRenderer: FC<{ nodeTypes: NodeTypes }> = ({ nodeTypes }) => {
  const useDiagram = useGetDiagramStore();
  const nodeIds = useDiagram((state) => state.nodeIds);

  return (
    <>
      {nodeIds.map((id) => {
        const Component =
          nodeTypes[useDiagram.getState().nodeTypes[id]] ||
          nodeTypes["default"] ||
          DefaultNode;
        return <WrappedNode nodeId={id} key={id} Component={Component} />;
      })}
    </>
  );
};
