import "./App.css";
import { Diagram } from "./components/Diagram/Diagram";
import { DiagramView } from "./components/Diagram/WrappedDiagram";
import { CustomNode } from "./components/Node/CustomNode";

function App() {
  return (
    <DiagramView
      id="diagram-1"
      // onConnection={(connection) => console.log(connection)}
      nodeTypes={{
        custom: CustomNode,
      }}
    />
  );
}

export default App;
