import t from "tap";
import sinon from "sinon";
import preValidationHook from "../../../src/hooks/pre-validation-hook.js";

t.test("preValidationHook", (t) => {
  t.test("should log parsed request body if present", (t) => {
    const fakeBody = JSON.stringify({ name: "Tomato" });
    const debug = sinon.stub();

    const request = {
      body: fakeBody,
      log: { debug },
    };
    const reply = {}; // Not used in hook, but required by signature

    preValidationHook(request, reply);

    t.ok(debug.calledOnce, "debug should be called");
    const [logArg, msg] = debug.firstCall.args;

    t.same(
      logArg,
      { requestBody: { name: "Tomato" } },
      "should log parsed request body",
    );
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

  t.test("should throw if body is not valid JSON", (t) => {
    const debug = sinon.stub();

    const request = {
      body: "{ not valid json }",
      log: { debug },
    };
    const reply = {};

    t.throws(
      () => {
        preValidationHook(request, reply);
      },
      SyntaxError,
      "should throw SyntaxError for invalid JSON",
    );

    t.end();
  });

  t.end();
});
