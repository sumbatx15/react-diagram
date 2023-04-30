import { FC, useLayoutEffect, useMemo } from "react";

import React, { createContext, useContext } from "react";
import { DiagramStoreHook, StoreState, useDiagrams } from "../../store";
import { ConfigSlice } from "../../store/configSlice";
import { NodeState, Vector } from "../../store/utils";
import { Diagram, DiagramProps } from "./Diagram";
interface NodeContextType {
  diagramId: string;
}

const DiagramContext = createContext<NodeContextType>({
  diagramId: "",
});

export const useDiagramContext = () => useContext(DiagramContext);

const DiagramContextProvider: React.FC<{
  children: React.ReactNode;
  id: string;
}> = ({ children, id: nodeId }) => {
  return (
    <DiagramContext.Provider value={{ diagramId: nodeId }}>
      {children}
    </DiagramContext.Provider>
  );
};

export const useGetDiagramStore = (): DiagramStoreHook => {
  const { diagramId } = useDiagramContext();
  return useDiagrams.getState().createDiagramOnce(diagramId);
};

export const useNodeData = <T,>() => {
  const { diagramId: nodeId } = useDiagramContext();
  const data = useGetDiagramStore((state) => state.nodeData[nodeId]) as T;
  const setter = useMemo(
    () => useDiagram.getState().updateNodeData.bind(null, nodeId),
    [nodeId]
  );

  return [data, setter] as [T, (data: T) => void];
};

export const useNodePosition = () => {
  const { diagramId: nodeId } = useDiagramContext();
  const position = useGetDiagramStore((state) => state.nodePositions[nodeId]);
  const setter = useMemo(
    () => useDiagram.getState().updateNodePosition.bind(null, nodeId),
    [nodeId]
  );

  return [position, setter] as [Vector, (position: Vector) => void];
};

export const useNodeState = () => {
  const { diagramId: nodeId } = useDiagramContext();
  const nodeState = useGetDiagramStore((state) => state.nodeStates[nodeId]);
  const setter = useMemo(
    () => useDiagram.getState().updateNodeState.bind(null, nodeId),
    [nodeId]
  );

  return [nodeState, setter] as [NodeState, (position: NodeState) => void];
};

export const DiagramView: FC<
  { id: string } & Partial<ConfigSlice> & DiagramProps
> = React.memo(({ id, onConnection, ...diagramProps }) => {
  useLayoutEffect(() => {
    const diagram = useDiagrams.getState().createDiagramOnce(id);
    diagram.setState({ onConnection });
  }, [id]);

  return (
    <DiagramContextProvider id={id}>
      <Diagram id={id} {...diagramProps} />
    </DiagramContextProvider>
  );
});
