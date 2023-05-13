import "./App.css";
import { Background } from "./components/background";
import { Diagram } from "./components/Diagram/Diagram";
import { createNodesAndEdges } from "./components/Diagram/utils";
import { DiagramView } from "./components/Diagram/WrappedDiagram";
import { CustomEdge } from "./components/Edge/CustomEdge";
import { FullscreenBtn } from "./components/Editor/FullscreenBtn";
import { CustomNode } from "./components/Node/CustomNode";
import { useDiagrams } from "./store";
import { createNode } from "./store/diagramStore";

function App() {
  const useDiagram = useDiagrams((state) => state.getDiagram("diagram-1"));

  const fitView = useDiagram((state) => state.fitView);
  const addNode = useDiagram((state) => state.addNode);
  const setNodes = useDiagram((state) => state.setNodes);
  const setEdges = useDiagram((state) => state.setEdges);
  const addEdge = useDiagram((state) => state.addEdge);

  const randomizePositions = () => {
    if (!useDiagram.getState().nodeIds.length) return;
    const positions = Object.entries(
      useDiagram.getState().nodePositions
    ).reduce((acc, [id, pos]) => {
      const x = Math.random() * 2000;
      const y = Math.random() * 1000;
      acc[id] = { x, y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
    useDiagram.setState({ nodePositions: positions });
    fitView();
  };
  const handleAdd = () => {
    addNode({
      ...createNode(),
      type: Math.random() > 0.5 ? "default" : "custom",
    });
  };

  const addMore = () => {
    const { edges, nodes } = createNodesAndEdges(10, 10);
    setNodes(nodes);
    setEdges(edges);
    setTimeout(() => {
      fitView();
    }, 500);
  };

  return (
    <div>
      <div style={{ width: "100vw", height: "150vh", padding: "100px" }}>
        <DiagramView
          id="diagram-1"
          style={{
            width: "1000px",
            height: "600px",
          }}
          nodeTypes={{
            custom: CustomNode,
          }}
        >
          <div style={{ position: "absolute", zIndex: 100 }}>
            <button onClick={handleAdd}>addnode</button>
            <button onClick={addMore}>add more</button>
            <button onClick={() => randomizePositions()}>randomize</button>
            <button onClick={() => fitView()}>fitView</button>
          </div>
          <Background id="diagram-1" color="black" />
        </DiagramView>
      </div>
    </div>
  );
}

export default App;
