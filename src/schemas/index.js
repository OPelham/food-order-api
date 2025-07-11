import fs from "node:fs";

export const schemas = JSON.parse(
  fs.readFileSync("./src/schemas/schemas.json", "utf8"),
);
