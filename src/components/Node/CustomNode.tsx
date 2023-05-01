import { FC } from "react";
import { NodeFC } from "../../types";
import { Handle } from "../Diagram/handle";
import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { useNode, useNodeData, useNodePosition } from "../Diagram/WrappedNode";
import { useToggle } from "react-use";

const Inp = () => {
  const [data, setData] = useNodeData<string>();
  return <input value={data} onInput={(e) => setData(e.target.value)} />;
};
export const CustomNode: NodeFC = ({ id }) => {
  const [show, toggle] = useToggle(true);
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
      {show && <Handle id="in" type="target" placement="left" />}
      {show && <Handle id="in2" type="target" placement="top" />}
      {show && <Handle id="out2" type="source" placement="bottom" />}

      <p /* onClick={toggle} */>CustomNode - {id}</p>
      <Stack>
        <Inp />
        {/* <input value={data} onInput={(e) => setData(e.target.value)} /> */}
      </Stack>
      <p>Heloo</p>
      <button onClick={toggle}>Toggle handles</button>
      {show && <Handle id="out" type="source" placement="right" />}
    </div>
  );
};
