import { NextFunction, Request, Response } from "express";
import { embeddingService } from "../services/EmbeddService";

export class embeddingController {
  constructor(private readonly EmbeddingService: embeddingService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // const payload = "";
      const file = req.file;
      // console.log(file);
      if (!file) {
        throw new Error("File is required");
      }
      const result = await this.EmbeddingService.handleCreateEmbeddings(
        file.path
      );
      res.status(201).json({ msg: "embeddings created successfully" });
      return;
    } catch (error) {
      res.json(500).json({ msg: "embeddings failed" });
      return;
    }
  }
}
