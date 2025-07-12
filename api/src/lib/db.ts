// import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

export const MongoDbclient = new MongoClient(
  process.env.MONGODB_ATLAS_URI || ""
);
export const collection = MongoDbclient.db(
  process.env.MONGODB_ATLAS_DB
).collection(process.env.MONGODB_ATLAS_COLLECTION!);

// const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
//   collection: collection,
//   indexName: "vector_index",
//   textKey: "text",
//   embeddingKey: "embedding",
// });
