import { embeddingRepo } from "../repository/EmbeddRepo";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export class embeddingService {
  constructor(private readonly embeddingRepo: embeddingRepo) {}

  async handleCreateEmbeddings(file: string) {
    try {
      const loader = new PDFLoader(file);
      const docs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 200,
      });
      const split = await splitter.splitDocuments(docs);
      console.log(split);
    } catch (error) {
      console.log(error);
    }
  }
}
