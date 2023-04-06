import { FC } from "react";
import { DiagramNode, useDiagram } from "../../store/diagramStore";

import React, { createContext, useContext } from "react";
import { Layer } from "../Layer/Layer";
import { Handle } from "./handle";
import { Box, Stack } from "@chakra-ui/react";
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
  console.log("nodeId:", nodeId);
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

export const DiagramNodeFC: FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <NodeContextProvider nodeId={nodeId}>
      <Layer id={nodeId}>
        <>
          <Stack pos="relative" bg="gray.700" width="60px" h="20px">
            <Box pos="absolute" left="-10px">
              <Handle id="in" type="target" />
            </Box>

            <Box pos="absolute" right="-10px">
              <Handle id="out" type="source" />
            </Box>
          </Stack>
        </>
      </Layer>
    </NodeContextProvider>
  );
};
