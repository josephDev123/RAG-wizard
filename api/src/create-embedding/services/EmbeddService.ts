import { embeddingRepo } from "../repository/EmbeddRepo";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { GlobalErrorHandler } from "../../lib/util/globalErrorHandler";
import { Document } from "@langchain/core/documents";
import OpenAI from "openai";

export class embeddingService {
  constructor(
    private readonly embeddingRepo: embeddingRepo,
    private readonly OpenAInit: OpenAI
  ) {}

  async handleCreateEmbeddings(filePath: string, fileType: string) {
    try {
      // load doc into page
      const docs = await this.FileLoaderFactory(fileType, filePath);

      // console.log("loaded doc", docs);

      // split the doc into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 200,
      });
      const splitDocument = await splitter.splitDocuments(docs);
      // console.log("split doc", split);

      // initial the vector embeddings model
      const model = new HuggingFaceTransformersEmbeddings({
        model: "Xenova/all-MiniLM-L6-v2",
      });

      const result = await this.embeddingRepo.create(model, splitDocument);
      // console.log(splitDocument);
      return result;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        new GlobalErrorHandler(error.name, error.message, 500, true);
      }

      if (error instanceof GlobalErrorHandler) {
        throw error;
      }
      new GlobalErrorHandler(
        "Unknown",
        "Failed to create embeddings",
        500,
        false
      );
    }
  }

  async FileLoaderFactory(
    fileType: string,
    filePath: string
  ): Promise<Document[]> {
    try {
      let docs: Document[] = [];

      if (fileType === "pdf") {
        const pdfLoader = new PDFLoader(filePath);
        docs = await pdfLoader.load();
      } else if (fileType === "csv") {
        const csvDocs = new CSVLoader(filePath);
        docs = await csvDocs.load();
        // throw new GlobalErrorHandler('UnsupportedFileType', `CSV loader not implemented`, 400, false);
      } else {
        // Unsupported file type - return empty array or throw
        throw new GlobalErrorHandler(
          "UnsupportedFileType",
          `File type ${fileType} not supported`,
          400,
          false
        );
      }

      return docs;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        new GlobalErrorHandler(error.name, error.message, 500, true);
      }
      throw error;
    }
  }

  async handleSearch(query: string) {
    try {
      // create model
      const model = new HuggingFaceTransformersEmbeddings({
        model: "Xenova/all-MiniLM-L6-v2",
      });

      const vector = await model.embedQuery(query);
      // console.log(vector);
      const searchResult = await this.embeddingRepo.vectorSearch(vector);

      const documents = searchResult.map(
        (item) =>
          new Document({
            pageContent: item.pageContent,
            metadata: item.metadata,
          })
      );

      const contextString = documents
        .map((doc) => doc.pageContent)
        .join("\n\n");

      //   const llm = new HuggingFaceInference({
      //     apiKey: process.env.HUGGINGFACE_API_KEY,
      //     model: "HuggingFaceTB/SmolLM2-135M-Instruct",
      //     temperature: 0.3,
      //   });

      // 3. Prepare system prompt
      const systemPrompt = `
Answer the question based on the context below. 
If the answer is not in the context, say "I don't know".

Context:
${contextString}

Answer:
    `.trim();

      const llmResponse = await this.OpenAInit.chat.completions.create({
        model: "openai/gpt-4.1",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          { role: "user", content: query },
        ],
      });

      // const prompt = ChatPromptTemplate.fromTemplate(`
      //   Answer the question based on the context below. If the answer is not in the context, say you don't know.

      //   Question: {question}

      //   Context:
      //   {context}

      //   Answer:
      // `);

      //   const chainInput = await prompt.formatMessages({
      //     question: query,
      //     context: contextString,
      //   });

      //   const response = await llm.invoke(chainInput);
      //   return {
      //     answer: response,
      //     sources: documents,
      //   };

      const answer =
        llmResponse.choices?.[0]?.message?.content ?? "No answer returned.";

      return {
        answer,
        sources: documents,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        new GlobalErrorHandler(error.name, error.message, 500, true);
      }

      if (error instanceof GlobalErrorHandler) {
        throw error;
      }
      new GlobalErrorHandler(
        "Unknown",
        "Failed to create embeddings",
        500,
        false
      );
    }
  }
}
