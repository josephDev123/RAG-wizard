import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_ATLAS_URI!;

export async function InitDb() {
  const MongoDbclient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  try {
    // Connect the client to the server (optional starting in v4.7)
    await MongoDbclient.connect();

    // Send a ping to confirm a successful connection
    await MongoDbclient.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    return MongoDbclient;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
