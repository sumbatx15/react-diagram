import { Box } from "@chakra-ui/react";
import "./App.css";
import { Background } from "./components/background";
import { Diagram } from "./components/Diagram/Diagram";
import { DiagramView } from "./components/Diagram/WrappedDiagram";
import { CustomEdge } from "./components/Edge/CustomEdge";
import { CustomNode } from "./components/Node/CustomNode";
import { useDiagrams } from "./store";

function App() {
  const useDiagram = useDiagrams((state) => state.getDiagram("diagram-1"));
  console.log("useDiagram:", useDiagram);
  return (
    <Box w="100vw" h="100vh">
      <DiagramView
        id="diagram-1"
        // onConnection={(connection) => console.log(connection)}
        nodeTypes={{
          custom: CustomNode,
        }}
        edgeTypes={
          {
            // default: CustomEdge,
          }
        }
      >
        <Background id="diagram-1" color="gray" />
      </DiagramView>
    </Box>
  );
}

export default App;
