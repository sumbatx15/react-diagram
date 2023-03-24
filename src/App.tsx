import {
  Box,
  DarkMode,
  Flex,
  Heading,
  Input,
  Stack,
  useMergeRefs,
} from "@chakra-ui/react";
import "./App.css";
import { Diagram } from "./components/Diagram";
import { Editor } from "./components/Editor/Editor";
import { Layer } from "./components/Layer/Layer";
import { useTodos } from "./playground/test";
import { useDiagram } from "./store/diagram";
import { useMemo } from "react";

const array1000 = Array.from({ length: 30 }, (_, i) => i);
function App() {
  const elements = useMemo(
    () =>
      array1000.map((i) => (
        <Layer key={i} id={i.toString()}>
          {/* <Box border="1px solid white" boxSize="60px" bg="gray.700">
            {i}
          </Box> */}

          <Stack
            color="white"
            p="8"
            boxSize="320px"
            bg="gray.700"
            boxShadow="2xl"
            rounded="2xl"
          >
            {i}
            <Heading>Heading</Heading>
            <Heading size="md">title</Heading>
            <Input />
            <Input />
            <Input />
            <Input />
            <Input />
          </Stack>
        </Layer>
      )),
    []
  );

  const minimized = useMemo(
    () =>
      array1000.map((i) => (
        <Layer key={i} id={i.toString()}>
          <Stack p="8" boxSize="320px" bg="gray.700">
            <Heading>{i}</Heading>
          </Stack>
        </Layer>
      )),
    []
  );

  const e = useDiagram((state) => (state.scale > 0.0 ? elements : minimized));
  console.count("App");
  return (
    <Diagram>
      <Flex gap="1" wrap="wrap">
        {e}
      </Flex>
    </Diagram>
  );
  return <Editor />;
}

export default App;
