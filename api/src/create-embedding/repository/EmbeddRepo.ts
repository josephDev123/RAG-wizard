import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";

import { Document, MongoClient } from "mongodb";

// Define or import EmbeddingsInterface
export interface EmbeddingsInterface {
  embedQuery(query: string): Promise<number[]>;
  embedDocuments(documents: string[]): Promise<number[][]>;
}

export class embeddingRepo {
  constructor(private readonly db: MongoClient) {}

  async create(embeddings: EmbeddingsInterface, allSplits: Document[]) {
    const collection = this.db
      .db(process.env.MONGODB_ATLAS_DB)
      .collection(process.env.MONGODB_ATLAS_COLLECTION!);

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection: collection,
      indexName: "rag-index",
      textKey: "text",
      embeddingKey: "embeddings",
    });
    const formattedSplits = allSplits.map((doc) => ({
      pageContent: doc.pageContent ?? "",
      metadata: { ...doc },
    }));
    await vectorStore.addDocuments(formattedSplits);
  }
}
