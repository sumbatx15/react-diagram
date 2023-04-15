import { glob } from "glob";
import fs from "fs-extra";
import path from "path";
import { minify } from "minify";

const srcDir = "src/store";
const outputFile = "output.txt";
const ignoreFiles = ["ignoreFile1.js", "ignoreFile2.js"];

// Create a Set for faster lookups
const ignoreFilesSet = new Set(ignoreFiles);

// Find all JavaScript files in the src/store directory using glob.sync
const files = glob.sync(`${srcDir}/*.ts`);

// Filter out the files that should be ignored
const filteredFiles = files.filter(
  (file) => !ignoreFilesSet.has(path.basename(file))
);

// Read the contents of the files, combine them, and write them to the output file
(async () => {
  const combinedContent = (
    await Promise.all(
      filteredFiles.map(async (file) => {
        const fileContent = await fs.readFile(file, "utf8");
        return fileContent + "\n";
      })
    )
  ).join("");

  await fs.writeFile(outputFile, combinedContent.replace(/\s+/g, ""));
  console.log(`Combined content written to ${outputFile}`);
})();
