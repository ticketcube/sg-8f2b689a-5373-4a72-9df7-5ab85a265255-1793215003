import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Send, Volume2, VolumeX, Menu, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
        headers: { "Content-Type": "application/json" },
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

        // Auto-speak response if voice is enabled
        if (isSpeaking) {
          speakText(data.response);
        }
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

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
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

      {/* Input Area */}
      <div className="bg-white border-t-4 border-gray-200 px-6 py-6">
        <div className="flex gap-4 items-center mb-4">
          <Button
            variant={isSpeaking ? "default" : "outline"}
            size="lg"
            onClick={toggleSpeech}
            className="p-6 rounded-2xl"
          >
            {isSpeaking ? (
              <Volume2 className="w-8 h-8" />
            ) : (
              <VolumeX className="w-8 h-8" />
            )}
          </Button>
          <span className="text-xl text-gray-600">
            {isSpeaking ? "Voice On" : "Voice Off"}
          </span>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-8 py-6 text-2xl rounded-3xl border-3 border-gray-300 focus:border-blue-500 focus:outline-none bg-gray-50"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="lg"
            onClick={handleVoiceInput}
            disabled={isRecording || isLoading}
            className={`p-6 rounded-2xl border-3 ${
              isRecording ? "bg-red-100 border-red-500" : "border-gray-300"
            }`}
          >
            <Mic
              className={`w-8 h-8 ${isRecording ? "text-red-500" : "text-gray-700"}`}
            />
          </Button>
          <Button
            size="lg"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-10 py-6 rounded-2xl text-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Send className="w-8 h-8" />
          </Button>
        </div>

        <p className="text-center text-gray-500 text-lg mt-4">
          Tap the microphone to speak or type your message
        </p>
      </div>
    </div>
  );
}