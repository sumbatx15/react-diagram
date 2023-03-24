import { Box, IconButton } from "@chakra-ui/react";
import { posterize } from "potrace";
import React, { useRef } from "react";
import { MdAddAPhoto } from "react-icons/md";
import Resizer from "react-image-file-resizer";
import { createLayer, defaultPotraceOptions, useLayers } from "../store/layers";

interface ImageUploadButtonProps {
  onImageSelect: (file: File) => void;
}

const resizeFile = (file: File): Promise<string> =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      600,
      600,
      "JPEG",
      100,
      0,
      (uri) => {
        resolve(uri as string);
      },
      "base64"
    );
  });

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onImageSelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const addLayer = useLayers((state) => state.addLayer);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      const image = await resizeFile(file);
      posterize(
        image,
        // buffer,
        {
          ...defaultPotraceOptions,
        },
        (err, svg) => {
          if (err) return console.log("err:", err);
          addLayer(
            createLayer({
              type: "image",
              src: image,
              content: svg,
              options: defaultPotraceOptions,
            })
          );
        }
      );

      inputRef.current?.value && (inputRef.current.value = "");

      onImageSelect(file);
    }
  };

  return (
    <Box>
      <IconButton
        aria-label="Upload Image"
        icon={<MdAddAPhoto />}
        size="lg"
        onClick={() => inputRef.current?.click()}
      />

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={inputRef}
        hidden
      />
    </Box>
  );
};
