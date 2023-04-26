import { DiagramEdge } from "../store/diagramStore";

export type NodeFC = React.FC<{ id: string }>;
export type EdgeFC = React.FC<DiagramEdge>;

export type NodeTypes = Record<string, NodeFC>;
export type EdgeTypes = Record<string, EdgeFC>;
