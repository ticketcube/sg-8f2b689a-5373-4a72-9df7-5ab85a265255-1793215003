import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceControls } from "@/components/VoiceControls";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function SeniorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastResponse, setLastResponse] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    getAuthToken();
  }, []);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setAuthToken(session.access_token);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !authToken) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setLastResponse(data.response);

        // Auto-speak response
        speakText(data.response);
      } else if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording || !authToken) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      
      // Immediately send the transcribed message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcript,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/smart-conversation", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            message: transcript,
            conversationHistory: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await response.json();

        if (data.response) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setLastResponse(data.response);
          speakText(data.response);
        } else if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get response. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast({
        title: "Error",
        description: "Could not capture voice. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleStop = () => {
    if (isRecording) {
      window.speechSynthesis.cancel();
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    setIsRecording(false);
    setIsSpeaking(false);
  };

  const handleHearAgain = () => {
    if (lastResponse) {
      speakText(lastResponse);
    } else {
      toast({
        title: "No Response",
        description: "There's no response to replay yet.",
      });
    }
  };

  const handleEndThread = () => {
    window.speechSynthesis.cancel();
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setLastResponse("");
    toast({
      title: "Conversation Ended",
      description: "Starting a fresh conversation.",
    });
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="lg" className="p-4">
            <Menu className="w-8 h-8 text-gray-700" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Chat Assistant</h1>
        </div>
        <Button variant="ghost" size="lg" className="p-4">
          <UserCircle className="w-8 h-8 text-gray-700" />
        </Button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-3xl px-8 py-6 shadow-lg ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : "bg-white text-gray-800 border-2 border-gray-200"
              }`}
            >
              <p className="text-2xl leading-relaxed">{message.content}</p>
              {mounted && (
                <span className="text-sm opacity-70 mt-3 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl px-8 py-6 shadow-lg border-2 border-gray-200">
              <div className="flex gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Replaced with VoiceControls */}
      <div className="bg-white border-t-4 border-gray-200">
        <VoiceControls
          onStart={handleVoiceInput}
          onStop={handleStop}
          onHearAgain={handleHearAgain}
          onEndThread={handleEndThread}
        />
      </div>
    </div>
  );
}