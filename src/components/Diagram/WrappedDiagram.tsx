import { FC, useLayoutEffect, useMemo } from "react";
import "../../App.css";

import React, { createContext, useContext } from "react";
import {
  DiagramBoundStore,
  ExtendedSlice,
  StoreState,
  useDiagrams,
} from "../../store";
import { ConfigSlice } from "../../store/configSlice";
import { NodeState, Vector } from "../../store/utils";
import { Diagram, DiagramProps } from "./Diagram";
interface NodeContextType {
  diagramId: string;
}

const DiagramContext = createContext<NodeContextType>({
  diagramId: "",
});

export const useDiagramContext = () => useContext(DiagramContext);

export const DiagramContextProvider: React.FC<{
  children: React.ReactNode;
  id: string;
}> = ({ children, id }) => {
  useLayoutEffect(() => {
    useDiagrams.getState().createDiagramOnce(id);
  }, [id]);
  return (
    <DiagramContext.Provider value={{ diagramId: id }}>
      {children}
    </DiagramContext.Provider>
  );
};

export const useGetDiagramStore = <
  TExtends extends ExtendedSlice = ExtendedSlice
>(): DiagramBoundStore<TExtends> => {
  const { diagramId } = useDiagramContext();
  return useDiagrams
    .getState()
    .createDiagramOnce(diagramId) as DiagramBoundStore<TExtends>;
};

export const DiagramView: FC<
  { id: string } & Partial<ConfigSlice> & DiagramProps
> = React.memo(({ id, onConnect: onConnection, ...diagramProps }) => {
  useLayoutEffect(() => {
    const diagram = useDiagrams.getState().createDiagramOnce(id);
    diagram.setState({ onConnect: onConnection });
  }, [id]);

  return (
    <DiagramContextProvider id={id}>
      <Diagram id={id} {...diagramProps} />
    </DiagramContextProvider>
  );
});
