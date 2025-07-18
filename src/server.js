import buildServer from "./app.js";

const fastify = buildServer();

// ==== start server ====
const start = async () => {
  try {
    await fastify.listen({
      port: fastify.applicationVariables.port,
      host: "0.0.0.0",
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
