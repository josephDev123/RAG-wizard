import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";

import { MongoClient } from "mongodb";

export class embeddingRepo {
  constructor(private readonly db: MongoClient) {}

  async create(vector_embeddings: any) {
    const collection = this.db
      .db(process.env.MONGODB_ATLAS_DB)
      .collection(process.env.MONGODB_ATLAS_COLLECTION!);

    const vectorStore = new MongoDBAtlasVectorSearch(vector_embeddings, {
      collection: collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embeddings",
    });
  }
}
