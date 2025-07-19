export function sanitizeUserInput(input) {
  return {
    //todo customise to our needs and call in prehandler
    ...input,
    name: input.name?.trim(),
    email: input.email?.trim().toLowerCase(),
  };

  // check the following free test fields
  // - name
}
