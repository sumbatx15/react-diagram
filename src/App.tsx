import "./App.css";
import { Diagram } from "./components/Diagram/Diagram";
import { CustomNode } from "./components/Node/CustomNode";

function App() {
  return (
    <Diagram
      nodeTypes={{
        custom: CustomNode,
      }}
    />
  );
}

export default App;
