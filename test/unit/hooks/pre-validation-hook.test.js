import t from "tap";
import sinon from "sinon";
import preValidationHook from "../../../src/hooks/pre-validation-hook.js";

t.test("preValidationHook", (t) => {
  t.test("should log parsed request body if present", (t) => {
    const fakeBody = { name: "Tomato" };
    const debug = sinon.stub();

    const request = {
      body: fakeBody,
      log: { debug },
    };
    const reply = {}; // Not used in hook, but required by signature

    preValidationHook(request, reply);

    t.ok(debug.calledOnce, "debug should be called");
    const [logArg, msg] = debug.firstCall.args;

    const expectedBody = { requestBody: { name: "Tomato" } };
    t.same(logArg, expectedBody, "should log parsed request body");
    t.equal(msg, "incoming request body", "should log correct message");
    t.end();
  });

  t.test("should log when no request body is present", (t) => {
    const debug = sinon.stub();

    const request = {
      body: null,
      log: { debug },
    };
    const reply = {};

    preValidationHook(request, reply);

    t.ok(debug.calledOnce, "debug should be called");
    t.same(
      debug.firstCall.args,
      ["no request body present"],
      "should log message when no body",
    );
    t.end();
  });

  t.end();
});
