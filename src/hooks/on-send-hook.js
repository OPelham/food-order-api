export default function onSendHook(request, reply, payload) {
    request.log.debug({responseBody: JSON.parse(payload)}, 'response payload');
}