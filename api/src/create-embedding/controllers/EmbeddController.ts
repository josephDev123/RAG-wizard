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
        return res.status(400).json({ msg: "No file uploaded" });
      }
      const result = await this.EmbeddingService.handleCreateEmbeddings(
        file.path
      );
      res.status(201).json({ msg: "embeddings created successfully" });
    } catch (error) {
      res.json(500).json({ msg: "embeddings failed" });
    }
  }
}
