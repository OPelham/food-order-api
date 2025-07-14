import Figlet from "figlet";

export default function onReadyHook(fastify) {
  console.log(
    Figlet.textSync(
      `${fastify.applicationVariables.applicationName}-${fastify.applicationVariables.version} is up!`,
      {
        horizontalLayout: "full",
        verticalLayout: "default",
        whitespaceBreak: false,
      },
    ),
  );
  console.log(fastify.printRoutes());
}
