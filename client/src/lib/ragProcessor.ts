import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "@/pdfWorker";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { toast } from "@/hooks/use-toast";
export class RAGProcessor {
  // Chunk documents into smaller pieces for better retrieval
  async chunkDocument(
    file: File,
    // content: string,
    chunkSize: number = 800,
    overlap: number = 200,
    cb: (chunk: string | number) => void
  ): Promise<any> {
    console.log("Chunking document with length:");
    try {
      const loader = new WebPDFLoader(file, {
        pdfjs: () => Promise.resolve(pdfjsLib),
      });
      const docs = await loader.load();
      console.log("loaded doc", docs);
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: overlap,
      });
      const splitDocuments = await splitter.splitDocuments(docs);
      console.log("split doc", splitDocuments);
      cb(splitDocuments.length);
      const formData = new FormData();
      formData.append("file", file); // ✅ file is a single File object

      const req = await fetch(
        `${import.meta.env.VITE_BASE_API}/vector/create-embedding`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!req.ok) {
        toast({
          title: "Creating Embedding Error",
          description: "Failed to Create Embedding.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Created  Embedding",
        description: "Created vector embedding successful.",
        variant: "default",
      });
      return req.json();
      // return splitDocuments.length;
    } catch (error) {
      console.log(error);
    }
  }

  // Simple keyword-based retrieval (in a real app, you'd use embeddings)
  async retrieveRelevantChunks(
    query: string,
    chunks: Array<{ chunk: string; source: string }>,
    topK: number = 3
  ): Promise<Array<{ chunk: string; source: string; score: number }>> {
    console.log("Retrieving relevant chunks for query:", query);

    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const scored = chunks.map(({ chunk, source }) => {
      const chunkLower = chunk.toLowerCase();
      let score = 0;

      // Score based on keyword matches
      for (const word of queryWords) {
        const matches = (chunkLower.match(new RegExp(word, "g")) || []).length;
        score += matches * (word.length > 4 ? 2 : 1); // Longer words get higher weight
      }

      // Boost score for chunks that contain multiple query words
      const wordsInChunk = queryWords.filter((word) =>
        chunkLower.includes(word)
      ).length;
      score += wordsInChunk * 3;

      return { chunk, source, score };
    });

    // Sort by relevance and return top K
    const relevant = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    console.log(
      `Found ${relevant.length} relevant chunks with scores:`,
      relevant.map((r) => r.score)
    );
    return relevant;
  }

  // Generate answer using retrieved context
  async generateAnswer(
    question: string,
    relevantChunks: Array<{ chunk: string; source: string }>
  ): Promise<string> {
    console.log("Generating answer for question:", question);
    console.log("Using context from chunks:", relevantChunks.length);

    if (relevantChunks.length === 0) {
      return "I couldn't find relevant information in the uploaded documents to answer your question. Please try rephrasing your question or upload more relevant documents.";
    }

    // Simple rule-based answer generation
    // In a real RAG system, this would use a language model
    const context = relevantChunks.map((chunk) => chunk.chunk).join("\n\n");
    const sources = [...new Set(relevantChunks.map((chunk) => chunk.source))];

    // Extract potential answers using simple heuristics
    const sentences = context
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const questionWords = question.toLowerCase().split(/\s+/);

    // Find sentences that contain question keywords
    const relevantSentences = sentences.filter((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      return questionWords.some(
        (word) => word.length > 2 && sentenceLower.includes(word)
      );
    });

    let answer = "";

    if (relevantSentences.length > 0) {
      // Take the most relevant sentences (up to 3)
      const bestSentences = relevantSentences.slice(0, 3);
      answer = bestSentences.join(". ").trim();

      // Clean up the answer
      if (
        !answer.endsWith(".") &&
        !answer.endsWith("!") &&
        !answer.endsWith("?")
      ) {
        answer += ".";
      }
    } else {
      // Fallback: use the first part of the most relevant chunk
      const firstChunk = relevantChunks[0].chunk;
      const firstSentences = firstChunk.split(/[.!?]+/).slice(0, 2);
      answer = firstSentences.join(". ").trim() + ".";
    }

    // Add source information
    answer += `\n\nSources: ${sources.join(", ")}`;

    console.log("Generated answer:", answer.substring(0, 100) + "...");
    return answer;
  }
}
