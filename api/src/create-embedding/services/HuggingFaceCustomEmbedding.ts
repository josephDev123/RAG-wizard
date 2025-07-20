// // hfEmbeddings.js

// import axios from "axios";

// export class HuggingFaceEmbeddings extends Embeddings {
//   model: string;
//   constructor(apiKey, model = "sentence-transformers/all-MiniLM-L6-v2") {
//     super();
//     this.apiKey = apiKey;
//     this.model = model;
//   }

//   async embedQuery(text) {
//     const result = await axios.post(
//       `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.model}`,
//       { inputs: text },
//       {
//         headers: { Authorization: `Bearer ${this.apiKey}` },
//       }
//     );

//     return result.data[0]; // return embedding vector
//   }

//   async embedDocuments(documents) {
//     const results = await Promise.all(documents.map((doc) => this.embedQuery(doc)));
//     return results;
//   }
// }
