import xss from "xss";

/**
 * Sanitizes and normalizes user input for ingredients.
 *
 * @param {Object} input - Raw user input
 * @returns {{ sanitizedInput: Object, wasSanitized: boolean }}
 */
export function sanitizeUserInput(input) {
  let wasSanitized = false;

  let processedName = input.name;
  if (typeof input.name === "string") {
    const trimmed = input.name.trim();
    processedName = xss(trimmed);

    if (processedName !== trimmed) {
      wasSanitized = true;
    }
  }

  return {
    sanitizedInput: {
      ...input,
      name: processedName,
    },
    wasSanitized,
  };
}
