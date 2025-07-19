import xss from "xss";

/**
 * Sanitizes and normalizes user input for ingredients.
 *
 * @param {Object} input - Raw user input
 * @returns {{ sanitizedInput: Object, wasSanitized: boolean }}
 */
export function sanitizeUserInput(input) {
  let wasSanitized = false;

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();

  const safeName = xss(name);
  if (safeName !== name) {
    wasSanitized = true;
  }

  return {
    sanitizedInput: {
      ...input,
      name: safeName,
      email,
    },
    wasSanitized,
  };
}
