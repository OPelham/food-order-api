import t from "tap";
import { sanitizeUserInput } from "../../../src/lib/ingredients-input-sanitiser.js";

t.test("sanitizeUserInput()", (t) => {
  t.test("returns same input if no sanitization needed", (t) => {
    const input = {
      name: "Olive Oil",
      quantity: 3,
    };

    const { sanitizedInput, wasSanitized } = sanitizeUserInput(input);

    t.equal(sanitizedInput.name, "Olive Oil");
    t.equal(sanitizedInput.quantity, 3);
    t.equal(wasSanitized, false);
    t.end();
  });

  t.test("sanitizes name if XSS is present", (t) => {
    const input = {
      name: "<script>alert(1)</script>",
    };

    const { sanitizedInput, wasSanitized } = sanitizeUserInput(input);

    t.match(sanitizedInput.name, /&lt;script&gt;.*&lt;\/script&gt;/);
    t.equal(wasSanitized, true);
    t.end();
  });

  t.test("trims whitespace from name", (t) => {
    const input = {
      name: "  Garlic  ",
    };

    const { sanitizedInput, wasSanitized } = sanitizeUserInput(input);

    t.equal(sanitizedInput.name, "Garlic");
    t.equal(wasSanitized, false);
    t.end();
  });

  t.test("handles missing name field gracefully", (t) => {
    const input = {
      quantity: 10,
    };

    const { sanitizedInput, wasSanitized } = sanitizeUserInput(input);

    t.same(sanitizedInput, {
      quantity: 10,
      name: undefined,
    });
    t.equal(sanitizedInput.name, undefined);
    t.equal(wasSanitized, false);
    t.end();
  });

  t.test("handles null name field gracefully", (t) => {
    const input = {
      name: null,
      quantity: 10,
    };

    const { sanitizedInput, wasSanitized } = sanitizeUserInput(input);

    t.same(sanitizedInput, {
      quantity: 10,
      name: null,
    });
    t.equal(sanitizedInput.name, null);
    t.equal(wasSanitized, false);
    t.end();
  });

  t.end();
});
