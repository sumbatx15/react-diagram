import { FC } from "react";
import { NodeFC } from "../../types";
import { Handle } from "../Diagram/handle";
import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { useNode, useNodeData, useNodePosition } from "../Diagram/WrappedNode";
export const CustomNode: NodeFC = ({ id }) => {
  const [data, setData] = useNodeData<string>();
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
      <Handle id="in" type="target" placement="left" />
      <p /* onClick={toggle} */>CustomNode - {id}</p>
      <Stack>
        <input value={data} onInput={(e) => setData(e.target.value)} />
        <input value={data} onInput={(e) => setData(e.target.value)} />
      </Stack>
      <p>Heloo</p>
      <button>Click me </button>
      <Handle id="out" type="source" placement="right" />
    </div>
  );
};
