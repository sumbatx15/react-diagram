import { FC } from "react";
import { NodeFC } from "../../types";
import { Handle } from "../Diagram/handle";
import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useNode, useNodeData, useNodePosition } from "../Diagram/WrappedNode";
export const CustomNode: NodeFC = ({ id }) => {
  const [data, setData] = useNodeData<string>();
  return (
    <div
      // shadow="xl"
      style={{
        maxWidth: "200px",
        borderRadius: "4px",
        position: "relative",
        background: "#070708",
        padding: "16px",
      }}
    >
      <Handle id="in" type="target" placement="left" />
      <Text /* onClick={toggle} */>CustomNode - {id}</Text>
      <Input value={data} onInput={(e) => setData(e.target.value)} />
      <Input value={data} onInput={(e) => setData(e.target.value)} />
      <Text>Heloo</Text>
      <Button>Click me </Button>
      <Handle id="out" type="source" placement="right" />
    </div>
  );
};
