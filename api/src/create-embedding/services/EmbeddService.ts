import { embeddingRepo } from "../repository/EmbeddRepo";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export class embeddingService {
  constructor(private readonly embeddingRepo: embeddingRepo) {}

  async handleCreateEmbeddings(file: string) {
    try {
      // load doc into page
      const loader = new PDFLoader(file);
      const docs = await loader.load();
      // console.log("loaded doc", docs);

      // split the doc into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 200,
      });
      const split = await splitter.splitDocuments(docs);
      // console.log("split doc", split);

      // create vector embeddings
      const model = new HuggingFaceTransformersEmbeddings({
        model: "Xenova/all-MiniLM-L6-v2",
      });
      const texts = split.map((doc) => doc.pageContent);
      const vector = await model.embedDocuments(texts);
      console.log("vector", vector);

      await this.embeddingRepo.create(model, split);
      console.log(split);
      return;

      //
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
