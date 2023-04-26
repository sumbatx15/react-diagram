import { FC } from "react";
import { NodeFC } from "../../types";
import { Handle } from "../Diagram/handle";
import { Box, Text } from "@chakra-ui/react";
import { useNodeData } from "../Diagram/WrappedNode";
export const DefaultNode: NodeFC = ({ id }) => {
  const [data] = useNodeData();
  return (
    <div
      // shadow="xl"
      style={{
        borderRadius: "4px",
        position: "relative",
        background: "#070708",
        padding: "16px",
      }}
    >
      <Box pos="absolute" left="0" top="50%" transform="translate(-50%, -50%)">
        <Handle id="in" type="target" placement="left" />
      </Box>
      <Text /* onClick={toggle} */>{data.label || `Default: ${id}`}</Text>
      <Box pos="absolute" right="0" top="50%" transform="translate(+50%, -50%)">
        <Handle id="out" type="source" placement="right" />
      </Box>
    </div>
  );
};
