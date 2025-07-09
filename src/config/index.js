import fs from "node:fs";

export const applicationVariables = JSON.parse(
  fs.readFileSync("./src/config/application-variables.json", "utf8"),
);
