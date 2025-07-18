import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_ATLAS_URI!;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const MongoDbclient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await MongoDbclient.connect();

    // Send a ping to confirm a successful connection
    await MongoDbclient.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await MongoDbclient.close();
  }
}
// run().catch(console.dir);
