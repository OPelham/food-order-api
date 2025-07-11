import RefParser from "@apidevtools/json-schema-ref-parser";
import fs from "fs/promises";

const input = "api-spec.yaml";
const output = "./src/schemas/schemas.json";

/**
 * Recursively converts `nullable: true` fields in a JSON Schema
 * into a JSON Schema-compliant `type: [originalType, 'null']`.
 *
 * @param {object} schema - A JSON Schema object
 * @returns {object} The transformed schema with proper nullable types
 */
function convertNullable(schema) {
  if (!schema || typeof schema !== "object") return schema;

  const cloned = { ...schema };

  // Recursively convert properties and items
  if (cloned.properties) {
    for (const key in cloned.properties) {
      cloned.properties[key] = convertNullable(cloned.properties[key]);
    }
  }

  if (cloned.items) {
    cloned.items = convertNullable(cloned.items);
  }

  // Transform nullable types
  if (cloned.nullable === true) {
    if (typeof cloned.type === "string") {
      cloned.type = [cloned.type, "null"];
    } else if (Array.isArray(cloned.type) && !cloned.type.includes("null")) {
      cloned.type.push("null");
    }
    delete cloned.nullable;
  }

  return cloned;
}

/**
 * Converts OpenAPI-style parameters into Fastify/AJV-compatible schema blocks:
 * `querystring`, `params`, and `headers`.
 *
 * @param {Array} parameters - Array of OpenAPI parameter objects
 * @returns {object} An object containing Fastify schema sections
 */
function convertParametersToSchemas(parameters = []) {
  const schema = {
    querystring: { type: "object", properties: {}, required: [] },
    params: { type: "object", properties: {}, required: [] },
    headers: { type: "object", properties: {}, required: [] },
  };

  for (const param of parameters) {
    const { name, in: location, required, schema: paramSchema } = param;

    const targetKey = {
      query: "querystring",
      path: "params",
      header: "headers",
    }[location];

    if (!targetKey || !name || !paramSchema) continue;

    const key = targetKey === "headers" ? name.toLowerCase() : name;
    schema[targetKey].properties[key] = convertNullable(paramSchema);

    if (required) {
      schema[targetKey].required.push(key);
    }
  }

  // Clean up empty objects
  for (const key of ["querystring", "params", "headers"]) {
    if (schema[key].required.length === 0) delete schema[key].required;
    if (Object.keys(schema[key].properties).length === 0) delete schema[key];
  }

  return schema;
}

/**
 * Extracts and converts response schemas (for application/json only)
 * from an OpenAPI operation into Fastify-compatible `response` schemas.
 *
 * @param {object} responses - OpenAPI `responses` object
 * @returns {object|undefined} The transformed response schemas or undefined
 */
function extractResponses(responses = {}) {
  const result = {};

  for (const [statusCode, response] of Object.entries(responses)) {
    const content = response.content?.["application/json"];
    const schema = content?.schema;

    if (schema) {
      result[statusCode] = convertNullable(schema);
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Main script logic: dereferences an OpenAPI spec,
 * transforms schemas for Fastify, and writes to disk.
 */
try {
  const dereferencedSpec = await RefParser.dereference(input);
  const paths = dereferencedSpec.paths;

  const result = {};

  for (const [route, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const opId = operation.operationId || `${method.toUpperCase()} ${route}`;

      const parameters = [
        ...(paths[route].parameters || []),
        ...(operation.parameters || []),
      ];

      const ajvSchema = convertParametersToSchemas(parameters);

      const bodySchema =
        operation.requestBody?.content?.["application/json"]?.schema;
      if (bodySchema) {
        ajvSchema.body = convertNullable(bodySchema);
      }

      const responseSchemas = extractResponses(operation.responses);
      if (responseSchemas) {
        ajvSchema.response = responseSchemas;
      }

      result[opId] = ajvSchema;
    }
  }

  await fs.writeFile(output, JSON.stringify(result, null, 2));
  console.log("✅ Schema generated and saved to", output);
} catch (err) {
  console.error("❌ Error generating schema:", err);
}
