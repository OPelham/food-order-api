import fs from "node:fs";

export const schemas = JSON.parse(
  fs.readFileSync("./src/schemas/dereferenced-schema.json", "utf8"),
);
