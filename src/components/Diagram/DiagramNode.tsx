import { FC } from "react";
import { DiagramNode, useDiagram } from "../../store/diagramStore";

import { Box, Flex, Text } from "@chakra-ui/react";
import React, { createContext, useContext } from "react";
import { Layer } from "../Layer/Layer";
import { Handle } from "./handle";
import { useToggle } from "react-use";
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
    const [show, toggle] = useToggle(true);
    return (
      <NodeContextProvider nodeId={nodeId}>
        <Layer id={nodeId}>
          <>
            <div
              // shadow="xl"
              style={{
                borderRadius: "4px",
                position: "relative",
                background: 'gray'
              }}
              pos="relative"
              bg="gray.700"
              p="4"
              py="2"
              color="white"
            >
              <Box
                pos="absolute"
                left="0"
                top="50%"
                transform="translate(-50%, -50%)"
              >
                <Handle id="in" type="target" />
              </Box>
              <Text onClick={toggle}>{nodeId}</Text>
              {show && (
                <Box
                  pos="absolute"
                  right="0"
                  top="50%"
                  transform="translate(+50%, -50%)"
                >
                  <Handle id="out" type="source" />
                </Box>
              )}
            </div>
          </>
        </Layer>
      </NodeContextProvider>
    );
  }
);
