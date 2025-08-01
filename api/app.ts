import express from "express";
import { IConfig } from "./src/lib/config";
import { GlobalErrorMiddleware } from "./src/lib/middleware/globalErrorMiddleware";
import cors from "cors";
import { InitDb } from "./src/lib/db";
import { VectorEmbeddingRouter } from "./src/create-embedding/route";

export async function createApp(config: IConfig) {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      credentials: true,
      origin: config.ALLOW_ORIGIN,
    })
  );

  console.log(config.ALLOW_ORIGIN);
  const MongoDbclient = await InitDb();
  app.use("/api", VectorEmbeddingRouter(MongoDbclient));

  app.use(GlobalErrorMiddleware);

  return app;
}
