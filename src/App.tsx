import { Box } from "@chakra-ui/react";
import "./App.css";
import { Diagram } from "./components/Diagram/Diagram";
import { DiagramView } from "./components/Diagram/WrappedDiagram";
import { CustomNode } from "./components/Node/CustomNode";

function App() {
  return (
    <Box w="100vw" h="100vh">
      <DiagramView
        id="diagram-1"
        // onConnection={(connection) => console.log(connection)}
        nodeTypes={{
          custom: CustomNode,
        }}
      />
    </Box>
  );
}

export default App;
