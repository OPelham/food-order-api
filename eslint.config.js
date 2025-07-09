import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      import: eslintPluginImport,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules, // disables formatting rules from Airbnb that conflict with Prettier
      "prettier/prettier": "error", // mark Prettier issues as ESLint errors
    },
  },
];
