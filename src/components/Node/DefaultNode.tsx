import { memo } from "react";
import { NodeFC } from "../../types";
import { Handle } from "../Diagram/handle";
import { useNodeData } from "../Diagram/WrappedNode";
export const DefaultNode: NodeFC = memo(({ id }) => {
  const [data] = useNodeData();
  return (
    <div
      // shadow="xl"
      style={{
        borderRadius: "4px",
        position: "relative",
        background: "#070708",
        padding: "16px",
        color: "white",
      }}
    >
      <p /* onClick={toggle} */>
        {(data as Partial<{ label: string }>)?.label || `Default: ${id}`}
      </p>
      <Handle id="in" type="target" placement="left"></Handle>

      <Handle id="out" type="source" placement="right" />
    </div>
  );
});
