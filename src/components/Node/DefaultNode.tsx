import { FC, memo } from "react";
import { NodeFC } from "../../types";
import { Handle } from "../Diagram/handle";
import { Box, Text } from "@chakra-ui/react";
import { useNodeData } from "../Diagram/WrappedNode";
export const DefaultNode: NodeFC = memo(({ id }) => {
  const [data] = useNodeData();
  console.log("data:", data);
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
      <Text /* onClick={toggle} */>{data.label || `Default: ${id}`}</Text>
      <Handle id="in" type="target" placement="left" />
      <Handle id="out" type="source" placement="right" />
    </div>
  );
});
