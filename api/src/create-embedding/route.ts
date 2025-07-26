import { MongoClient } from "mongodb";
import { Router } from "express";
import { ratelimitMiddleware } from "../lib/middleware/rateLimiterMiddleware";
import { embeddingController } from "./controllers/EmbeddController";
import { embeddingService } from "./services/EmbeddService";
import { embeddingRepo } from "./repository/EmbeddRepo";
import multer from "multer";

export function VectorEmbeddingRouter(db: MongoClient) {
  let windowMs = 5 * 60 * 1000;
  const VectorEmbeddingRouter = Router();
  const EmbeddRepo = new embeddingRepo(db);
  const embedService = new embeddingService(EmbeddRepo);
  const controller = new embeddingController(embedService);

  const upload = multer({ dest: "./upload" });
  VectorEmbeddingRouter.post(
    "/vector/create-embedding",
    ratelimitMiddleware({
      windowMs: windowMs,
      limit: 4,
      standardHeaders: "draft-8",
      legacyHeaders: true,
    }),
    upload.single("file"),
    controller.create.bind(controller)
  );

  VectorEmbeddingRouter.post(
    "/vector/search",
    ratelimitMiddleware({
      windowMs: windowMs,
      limit: 4,
      standardHeaders: "draft-8",
      legacyHeaders: true,
    }),

    controller.search.bind(controller)
  );

  return VectorEmbeddingRouter;
}
