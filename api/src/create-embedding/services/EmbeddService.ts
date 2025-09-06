import { embeddingRepo } from "../repository/EmbeddRepo";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { GlobalErrorHandler } from "../../lib/util/globalErrorHandler";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
// import { HuggingFaceInference } from "@langchain/community/llms/hf";
import OpenAI from "openai";
// import { ChatOpenAI } from "@langchain/openai";

export class embeddingService {
  constructor(
    private readonly embeddingRepo: embeddingRepo,
    private readonly OpenAInit: OpenAI
  ) {}

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
      const documents = await splitter.splitDocuments(docs);
      // console.log("split doc", split);

      // create vector embeddings
      const model = new HuggingFaceTransformersEmbeddings({
        model: "Xenova/all-MiniLM-L6-v2",
      });

      const result = await this.embeddingRepo.create(model, documents);
      console.log(documents);
      return result;

      //
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
