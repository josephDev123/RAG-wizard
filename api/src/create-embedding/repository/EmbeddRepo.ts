import { MongoClient } from "mongodb";

export class embeddingRepo {
  constructor(private readonly db: MongoClient) {}
}
