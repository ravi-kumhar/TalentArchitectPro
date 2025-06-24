import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { aiAPI } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { 
  Bot, 
  Send, 
  X, 
  FileText, 
  Wand2, 
  Users, 
  MessageSquare,
  Loader2
} from "lucide-react";
import type { ChatMessage } from "@/types";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your HR assistant. I can help you with job descriptions, candidate screening, policy questions, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => aiAPI.chat(message),
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.message || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    let message = "";
    switch (action) {
      case "generate-jd":
        message = "Help me create a job description for a Senior Software Engineer position";
        break;
      case "screen-candidate":
        message = "How do I effectively screen candidates for technical roles?";
        break;
      case "interview-questions":
        message = "Generate interview questions for a product manager role";
        break;
      case "policy-question":
        message = "What are the best practices for remote work policies?";
        break;
      default:
        return;
    }
    
    setInputMessage(message);
  };

  const quickActions = [
    {
      id: "generate-jd",
      title: "Generate Job Description",
      icon: FileText,
      description: "Create compelling job descriptions with AI",
    },
    {
      id: "screen-candidate",
      title: "Candidate Screening",
      icon: Users,
      description: "Get advice on screening candidates",
    },
    {
      id: "interview-questions",
      title: "Interview Questions",
      icon: MessageSquare,
      description: "Generate role-specific interview questions",
    },
    {
      id: "policy-question",
      title: "HR Policies",
      icon: Wand2,
      description: "Ask about HR policies and best practices",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">HR Assistant</DialogTitle>
                <p className="text-sm text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white text-sm w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`rounded-lg p-3 max-w-xs break-words ${
                    message.role === "user"
                      ? "bg-primary text-white ml-auto"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Quick action buttons for first assistant message */}
                  {message.role === "assistant" && message.id === "1" && (
                    <div className="mt-3 space-y-2">
                      {quickActions.slice(0, 2).map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          className="w-full text-left bg-white border border-gray-200 rounded p-2 text-xs hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <action.icon className="w-3 h-3" />
                            <span>{action.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white text-sm w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-muted-foreground mb-3">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="text-left p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <action.icon className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium">{action.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Ask me anything about HR..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send • Powered by GPT-4
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
