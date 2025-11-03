import express from "express";
import { IConfig } from "./src/lib/config";
import { GlobalErrorMiddleware } from "./src/lib/middleware/globalErrorMiddleware";
import cors from "cors";
import { VectorEmbeddingRouter } from "./src/create-embedding/route";
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import { Logger } from "pino";

export async function createApp(
  config: IConfig,
  MongoDbclient: MongoClient,
  OpenAInit: OpenAI,
  logger: Logger
) {
  // logger.info({ greeting: "hello world" }, "logging ...");
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      credentials: true,
      origin: config.ALLOW_ORIGIN,
    })
  );

  // console.log(config.ALLOW_ORIGIN);

  app.use("/api", VectorEmbeddingRouter(MongoDbclient, OpenAInit));

  app.use(GlobalErrorMiddleware);

  return app;
}
