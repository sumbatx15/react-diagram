import { DiagramEdge } from "../store/diagramStore";

export type NodeProps = { id: string };

export type NodeFC<T = any> = React.FC<NodeProps & T>;
export type EdgeFC = React.FC<DiagramEdge>;

export type NodeTypes = Record<string, NodeFC>;
export type EdgeTypes = Record<string, EdgeFC>;
