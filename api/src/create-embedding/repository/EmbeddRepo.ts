import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Document, MongoClient } from "mongodb";
import { GlobalErrorHandler } from "../../lib/util/globalErrorHandler";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export class embeddingRepo {
  constructor(private readonly db: MongoClient) {}

  async create(
    model: HuggingFaceTransformersEmbeddings,
    documents: Document[]
  ) {
    try {
      const collection = this.db
        .db(process.env.MONGODB_ATLAS_DB)
        .collection(process.env.MONGODB_ATLAS_COLLECTION!);

      await collection.deleteMany({});

      const vectorStore = new MongoDBAtlasVectorSearch(model, {
        collection: collection,
        indexName: "rag-index",
        textKey: "pageContent",
        embeddingKey: "embedding",
      });
      const documentsSplit = documents.map((doc) => ({
        pageContent: doc.pageContent ?? "",
        metadata: { ...doc },
      }));
      await vectorStore.addDocuments(documentsSplit);
      return { msg: "vector embedding created" };
    } catch (error) {
      console.error("Error creating embeddings:", error);
      if (error instanceof Error) {
        new GlobalErrorHandler(error.name, error.message, 500, true);
      }
      new GlobalErrorHandler(
        "Unknown",
        "Failed to create embeddings",
        500,
        false
      );
    }
  }

  async vectorSearch(vector: number[]) {
    try {
      const collection = this.db
        .db(process.env.MONGODB_ATLAS_DB)
        .collection(process.env.MONGODB_ATLAS_COLLECTION!);

      const result = await collection
        .aggregate([
          {
            $vectorSearch: {
              index: "rag-index",
              path: "embedding",
              queryVector: vector,
              numCandidates: 100, // optional: how many candidates to examine
              limit: 5, // how many top matches to return
            },
          },
          {
            $project: {
              _id: 0,
              pageContent: 1,
              score: { $meta: "vectorSearchScore" },
              metadata: 1,
            },
          },
        ])
        .toArray();
      // console.log("result", result);
      // const formatResult = result.map((result) => result.pageContent);

      return result;
    } catch (error) {
      console.error("Error performing vector search:", error);
      if (error instanceof Error) {
        throw new GlobalErrorHandler(error.name, error.message, 500, true);
      }
      throw new GlobalErrorHandler(
        "Unknown",
        "Vector search failed",
        500,
        false
      );
    }
  }
}
