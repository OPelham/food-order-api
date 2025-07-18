export default function preValidationHook(request, reply) {
  if (request.body) {
    request.log.debug({ requestBody: request.body }, "incoming request body");
  } else {
    request.log.debug("no request body present");
  }
}
