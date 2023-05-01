import { Button } from "@chakra-ui/react";
import { animated as a, useSpring } from "@react-spring/web";
import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import { shallow } from "zustand/shallow";
import { useEdge } from "../../hooks/useEdge";
import { createEdgePosition, createZeroVector } from "../../store/utils";
import { EdgeFC } from "../../types";
import { intersectionObserver } from "../../utils/intersectionObserver";
import { getCubicBezierPathData } from "../Diagram/edge";
import { getBezierPath, getEdgeCenter } from "../Diagram/utils";
import { useGetDiagramStore } from "../Diagram/WrappedDiagram";

const foreignObjectSize = 24;
export const CustomEdge: EdgeFC = (edge) => {
  const [deleteEdge, setSelectedEdges] = useGetDiagramStore()(
    (state) => [state.deleteEdge, state.setSelectedEdges],
    shallow
  );

  const [isHovered, setIsHovered] = useState(false);
  const {
    bezier: [path],
    sourceX,
    sourceY,
    targetX,
    targetY,
    selected,
  } = useEdge(edge.id);
  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const handleRemoveEdge = () => {
    console.log("deleteEdge:", deleteEdge);
    return deleteEdge(edge.id);
  };

  return (
    <g
      style={{ cursor: "pointer", pointerEvents: "auto", zIndex: 1000 }}
      onMouseOverCapture={() => setIsHovered(true)}
      onMouseOutCapture={() => setIsHovered(false)}
      onClick={() => setSelectedEdges([edge.id])}
    >
      {/* <path
        className="react-flow__edge-path-hoverer"
        strokeLinecap="round"
        style={{
          zIndex: 100,
          // eslint-disable-next-line no-nested-ternary
          stroke: "white",
          fill: "none",
          strokeWidth: selected || isHovered ? "6px" : "0px",
          opacity: selected || isHovered ? 1 : 0,
          filter: selected
            ? "drop-shadow(0 0 4px black)"
            : "drop-shadow(0 0 0 black)",
        }}
        d={path}
      /> */}
      <path
        d={path}
        className="edge ghost"
        fill="none"
        stroke={selected || isHovered ? "rgba(0, 0, 0, 0.1)" : "transparent"}
        filter="drop-shadow(0 0 4px black)"
      />
      <path
        className={`edge ${edge.animated ? "animated" : ""}`}
        style={{ pointerEvents: "none" }}
        d={path}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        style={{
          zIndex: 1000,
          background: "transparent",
          pointerEvents: !selected ? "none" : "initial",
        }}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div
          style={{
            zIndex: 1000,

            display: selected ? "flex" : "none",
            background: "transparent",
          }}
          className="flex w-full h-full items-center justify-center bg-none cursor-pointer"
          onClick={handleRemoveEdge}
        >
          <div
            onClick={handleRemoveEdge}
            className="flex items-center transition-all justify-center border-2  cursor-pointer rounded-full hover:shadow  bg-white"
            style={{
              width: 20,
              height: 20,
              boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            X
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
