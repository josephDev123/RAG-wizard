
import React from 'react';
import { MessageCircle, User, Bot, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  question: string;
  answer: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  currentAnswer: string;
  chatHistory: ChatMessage[];
  isGenerating: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentAnswer,
  chatHistory,
  isGenerating
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Chat History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {/* Chat History */}
            {chatHistory.map((chat, index) => (
              <div key={index} className="space-y-3">
                {/* Question */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white text-sm">{chat.question}</p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-white/50">
                      <Clock className="w-3 h-3 mr-1" />
                      {chat.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Answer */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Bot className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white text-sm whitespace-pre-wrap">{chat.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Current Answer (if generating) */}
            {currentAnswer && !chatHistory.some(chat => chat.answer === currentAnswer) && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <Bot className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white text-sm whitespace-pre-wrap">{currentAnswer}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <Bot className="w-4 h-4 text-green-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
