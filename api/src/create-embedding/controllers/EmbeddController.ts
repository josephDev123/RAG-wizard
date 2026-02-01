import { NextFunction, Request, Response } from "express";
import { embeddingService } from "../services/EmbeddService";
import { GlobalErrorHandler } from "../../lib/util/globalErrorHandler";

export class embeddingController {
  constructor(private readonly EmbeddingService: embeddingService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // const payload = "";
      const file = req.file;
      const fileType = req.file?.mimetype.split("/")[1];
      console.log(fileType);
      if (!file || !fileType) {
        throw new Error("File is required");
      }
      const result = await this.EmbeddingService.handleCreateEmbeddings(
        file.path,
        fileType,
      );
      res
        .status(201)
        .json({ msg: result?.msg || "embeddings created successfully" });
      return;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        next(new GlobalErrorHandler(error.name, error.message, 500, true));
      }

      if (error instanceof GlobalErrorHandler) {
        next(error);
      }
      next(
        new GlobalErrorHandler(
          "Unknown",
          "Failed to create embeddings",
          500,
          false,
        ),
      );
      return;
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const payload = body.query;
      const result = await this.EmbeddingService.handleSearch(payload);
      res.status(200).json({ data: result, msg: "vector search successful" });
      return;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        next(new GlobalErrorHandler(error.name, error.message, 500, true));
      }

      if (error instanceof GlobalErrorHandler) {
        next(error);
      }
      next(
        new GlobalErrorHandler(
          "Unknown",
          "Failed to create embeddings",
          500,
          false,
        ),
      );
    }
  }
}
