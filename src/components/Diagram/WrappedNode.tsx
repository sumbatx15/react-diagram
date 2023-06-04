import { FC, useMemo } from "react";
import { DiagramNode } from "../../store/diagramStore";

import React, { createContext, useContext } from "react";
import { NodeFC } from "../../types";
import { Draggable } from "../Draggable/Draggable";
import { NodeState, Vector } from "../../store/utils";
import { useGetDiagramStore } from "./WrappedDiagram";
interface NodeContextType {
  nodeId: string;
}

const NodeContext = createContext<NodeContextType>({
  nodeId: "",
});

export const useNodeContext = () => useContext(NodeContext);

const NodeContextProvider: React.FC<{
  children: React.ReactNode;
  nodeId: string;
}> = ({ children, nodeId }) => {
  return (
    <NodeContext.Provider value={{ nodeId }}>{children}</NodeContext.Provider>
  );
};

// overload when selector is provided
export function useNode<T extends (node: DiagramNode) => any>(
  selector: T
): ReturnType<T>;

// overload when selector is not provided
export function useNode(selector?: undefined): DiagramNode;

// implementation
export function useNode<T extends (node: DiagramNode) => any | undefined>(
  selector?: T
) {
  const { nodeId } = useNodeContext();
  const useDiagram = useGetDiagramStore();
  return useDiagram((state) =>
    selector ? selector(state.getNode(nodeId)!) : state.getNode(nodeId)
  );
}

export const useNodeData = <T,>(nodeId?: string) => {
  const ctx = useNodeContext();

  const useDiagram = useGetDiagramStore();
  const data = useDiagram((state) => state.nodeData[nodeId || ctx.nodeId]) as T;
  const setter = useMemo(
    () => useDiagram.getState().updateNodeData.bind(null, nodeId || ctx.nodeId),
    [nodeId || ctx.nodeId]
  );

  return [data, setter] as [T, (data: T) => void];
};

export const useNodePosition = () => {
  const { nodeId } = useNodeContext();
  const useDiagram = useGetDiagramStore();

  const position = useDiagram((state) => state.nodePositions[nodeId]);
  const setter = useMemo(
    () => useDiagram.getState().updateNodePosition.bind(null, nodeId),
    [nodeId]
  );

  return [position, setter] as [Vector, (position: Vector) => void];
};

export const useNodeState = () => {
  const { nodeId } = useNodeContext();
  const useDiagram = useGetDiagramStore();

  const nodeState = useDiagram((state) => state.nodeStates[nodeId]);
  const setter = useMemo(
    () => useDiagram.getState().updateNodeState.bind(null, nodeId),
    [nodeId]
  );

  return [nodeState, setter] as [NodeState, (position: NodeState) => void];
};

export const WrappedNode: FC<{ nodeId: string; Component: NodeFC }> =
  React.memo(({ nodeId, Component }) => {
    return (
      <NodeContextProvider nodeId={nodeId}>
        <Draggable id={nodeId}>
          <Component id={nodeId} />
        </Draggable>
      </NodeContextProvider>
    );
  });
