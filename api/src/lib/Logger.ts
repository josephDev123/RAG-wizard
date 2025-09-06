import pino from "pino";

export function Logger(level: string) {
  const pinoLogger = pino(
    {
      level: level || "info",
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
  );
  return pinoLogger;
}

const transport = pino.transport({
  targets: [
    {
      target: "pino/file",
      //   options: { destination: `${__dirname}/app.log`, mkdir: true },
    },
    { target: "pino/file", options: { destination: 1, mkdir: true } },
  ],
});
