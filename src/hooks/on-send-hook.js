export default function onSendHook(request, reply, payload) {
    request.log.debug({response: JSON.parse(payload)}, 'response payload');
}