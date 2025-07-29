import React, { useState, useRef, useEffect } from "react";
import { Upload, MessageCircle, FileText, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/DocumentUpload";
import ChatInterface from "@/components/ChatInterface";
import { RAGProcessor } from "@/lib/ragProcessor";

type InLocalstorage = {
  document: number;
  chunk: number;
  answers: number;
};

type IChatHistory = { question: string; answer: string; timestamp: Date };
const Index = () => {
  const [documents, setDocuments] = useState<{
    id: string;
    name: string;
    content: File;
    chunks: number;
    docLength: number;
  }>();

  const [isProcessing, setIsProcessing] = useState(false);
  const [ragProcessor] = useState(() => new RAGProcessor());
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<IChatHistory[]>([]);
  // const [nLocalStorage, setNlocalStorage] = useState<InLocalstorage>({
  //   document: 0,
  //   answers: 0,
  //   chunk: 0,
  // });

  const itemNLocalStorage: InLocalstorage = JSON.parse(
    localStorage.getItem("nLocalStorage") ||
      '{"answers":0,"chunk":0,"document":0}'
  );

  useEffect(() => {
    // get save answers
    const answerLocalStorage: IChatHistory[] = JSON.parse(
      localStorage.getItem("localStorageAnswer") || "[]"
    );

    setChatHistory(answerLocalStorage);
    console.log(answerLocalStorage);
  }, []);

  const handleDocumentUpload = async (files: FileList) => {
    setIsProcessing(true);
    console.log("Processing uploaded documents:", files.length);

    try {
      // for (const file of Array.from(files)) {
      // const content = await file.text();

      function cb(chunks: number) {
        const doc = {
          id: crypto.randomUUID(),
          name: files[0].name,
          content: files[0],
          chunks,
          docLength: files.length,
        };

        setDocuments((prev) => ({ ...prev, ...doc }));

        localStorage.setItem(
          "nLocalStorage",
          JSON.stringify({
            document: files.length,
            answers: 0,
            chunk: chunks,
          })
        );
      }
      let result = await ragProcessor.chunkDocument(files[0], 800, 200, cb);

      console.log(result);
      toast({
        title: "Documents Processed",
        description: `Successfully processed  document for RAG retrieval.`,
      });
    } catch (error) {
      console.error("Error processing documents:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process one or more documents.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsGenerating(true);
    console.log("Processing question:", question);

    try {
      // Retrieve relevant chunks from all documents
      const req = await fetch(
        `${import.meta.env.VITE_BASE_API}/vector/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: question }),
        }
      );
      if (!req.ok) {
        toast({
          title: "Generation Error",
          description: "Failed to generate an answer. Please try again.",
          variant: "destructive",
        });

        return;
      }

      const response = await req.json();
      const result = response.data.pageContent;

      console.log(result);
      setAnswer(result);
      setChatHistory([
        ...chatHistory,
        { answer: result, question, timestamp: new Date() },
      ]);

      // answer counter
      const itemNLocalStorage: InLocalstorage = JSON.parse(
        localStorage.getItem("nLocalStorage") ||
          '{"answers":0,"chunk":0,"document":0}'
      );

      localStorage.setItem(
        "nLocalStorage",
        JSON.stringify({
          ...itemNLocalStorage,
          answers: itemNLocalStorage.answers + 1,
        })
      );

      // Save answer in localStorage
      const answerLocalStorage: IChatHistory[] = JSON.parse(
        localStorage.getItem("localStorageAnswer") || "[]"
      );

      localStorage.setItem(
        "localStorageAnswer",
        JSON.stringify([
          ...answerLocalStorage,
          { answer: result, question, timestamp: new Date() },
        ])
      );

      toast({
        title: "Answer Generated",
        description:
          "Your question has been answered using the uploaded documents.",
      });
      setQuestion("");
    } catch (error) {
      console.error("Error generating answer:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate an answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              RAG Assistant
              <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-400" />
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Upload your documents and ask questions. Get intelligent answers
              powered by Retrieval-Augmented Generation technology.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold">
                  {documents?.docLength || itemNLocalStorage?.document}
                </div>
                <div className="text-white/70">
                  Documents Uploaded (<b>note:</b> only 1 is process)
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">
                  {chatHistory.length || itemNLocalStorage.answers}
                </div>
                <div className="text-white/70">Questions Answered</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold">
                  {documents?.chunks || itemNLocalStorage.chunk}
                </div>
                <div className="text-white/70">Text Chunks</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
            {/* Document Upload */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  isProcessing={isProcessing}
                  documents={documents}
                />
              </CardContent>
            </Card>

            {/* Question Interface */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Ask Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Ask a question about your uploaded documents..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder-white/50"
                    rows={4}
                  />
                  <Button
                    type="submit"
                    disabled={isGenerating || documents?.docLength === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-pulse" />
                        Generating Answer...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Ask Question
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          {(answer || chatHistory.length > 0) && (
            <div className="mt-8">
              <ChatInterface
                currentAnswer={answer}
                chatHistory={chatHistory}
                isGenerating={isGenerating}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
