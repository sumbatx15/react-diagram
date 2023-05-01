import { keyBy, mapValues } from "lodash-es";
import { DiagramEdge } from "../store/diagramStore";
import { DiagramNode } from "../store/utils";

export const createStoreNodes = (nodes: DiagramNode[]) => {
  const nodesById = keyBy(nodes, "id");
  return {
    nodeIds: Object.keys(nodesById),
    nodePositions: mapValues(nodesById, (node) => node.position),
    nodeData: mapValues(nodesById, (node) => node.data),
    nodeStates: mapValues(nodesById, (node) => node.state),
    nodeTypes: mapValues(nodesById, (node) => node.type || "default"),
  };
};

export const getNodeEdges = (nodeId: string, edges: DiagramEdge[]) => {
  return edges.filter(
    (edge) => edge.source === nodeId || edge.target === nodeId
  );
};
