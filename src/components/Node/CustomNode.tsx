import { FC } from "react";
import { NodeFC } from "../../types";
import { Handle } from "../Diagram/handle";
import { useNode, useNodeData, useNodePosition } from "../Diagram/WrappedNode";
import { useToggle } from "react-use";

const Inp = () => {
  const [data, setData] = useNodeData<string>();
  return (
    <input
      value={data}
      onInput={(e) => setData((e.target as HTMLInputElement).value)}
    />
  );
};
export const CustomNode: NodeFC = ({ id }) => {
  const [show, toggle] = useToggle(true);
  const node = useNode((state) => state.type);
  console.log("node:", node);

  return (
    <div
      style={{
        borderRadius: "4px",
        position: "relative",
        background: "#070708",
        padding: "16px",
        boxShadow: "0 0 15px rgba(0,0,0,0.2)",
      }}
    >
      {show && <Handle id="in" type="target" placement="left" />}
      {show && <Handle id="in2" type="target" placement="top" />}
      {show && <Handle id="out2" type="source" placement="bottom" />}

      <p /* onClick={toggle} */>CustomNode - {id}</p>
      <Inp />
      <button onClick={toggle}>Toggle handles</button>
      {show && <Handle id="out" type="source" placement="right" />}
    </div>
  );
};
