import { FC } from "react";
import { DiagramNode, useDiagram } from "../../store/diagramStore";

import React, { createContext, useContext } from "react";
import { Layer } from "../Layer/Layer";
import { Handle } from "./handle";
import { Box, Stack, Text } from "@chakra-ui/react";
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
            <Stack
              rounded="xl"
              pos="relative"
              bg="gray.700"
              p="4"
              py="2"
              spacing="0"
            >
              <Box pos="absolute" left="-10px">
                <Handle id="in" type="target" />
              </Box>
              <Text>{nodeId}</Text>
              <Box pos="absolute" right="-10px" top="20px">
                <Handle id="out" type="source" />
              </Box>
            </Stack>
          </>
        </Layer>
      </NodeContextProvider>
    );
  }
);
