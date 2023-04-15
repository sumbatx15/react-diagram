import { FC } from "react";
import { DiagramNode, useDiagram } from "../../store/diagramStore";

import { Box, Text } from "@chakra-ui/react";
import React, { createContext, useContext } from "react";
import { Layer } from "../Layer/Layer";
import { Handle } from "./handle";
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

export const useNode = (
  selector?: (node: DiagramNode) => void,
  equals?: (a: void, b: void) => boolean
) => {
  const { nodeId } = useNodeContext();
  return useDiagram((state) => {
    if (selector) {
      return selector(state.getNode(nodeId)!);
    }
    return state.getNode(nodeId)!;
  }, equals) as unknown as DiagramNode;
};

export const DiagramNodeFC: FC<{ nodeId: string }> = React.memo(
  ({ nodeId }) => {
    return (
      <NodeContextProvider nodeId={nodeId}>
        <Layer id={nodeId}>
          <>
            <Box
              rounded="md"
              // shadow="xl"
              pos="relative"
              bg="gray.700"
              p="4"
              py="2"
            >
              <Box
                pos="absolute"
                left="0"
                top="50%"
                transform="translate(-50%, -50%)"
              >
                <Handle id="in" type="target" />
              </Box>
              <Text>{nodeId}</Text>
              <Box
                pos="absolute"
                right="0"
                top="50%"
                transform="translate(+50%, -50%)"
              >
                <Handle id="out" type="source" />
              </Box>
            </Box>
          </>
        </Layer>
      </NodeContextProvider>
    );
  }
);
