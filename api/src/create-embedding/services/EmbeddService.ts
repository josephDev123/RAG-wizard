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

      // split the doc into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 200,
      });
      const split = await splitter.splitDocuments(docs);

      // create vector embeddings
      const model = new HuggingFaceTransformersEmbeddings({
        model: "Xenova/all-MiniLM-L6-v2",
      });
      const texts = split.map((doc) => doc.pageContent);
      const vector_embeddings = await model.embedDocuments(texts);

      await this.embeddingRepo.create(model, split);
      console.log(split);

      //
    } catch (error) {
      console.log(error);
    }
  }
}
