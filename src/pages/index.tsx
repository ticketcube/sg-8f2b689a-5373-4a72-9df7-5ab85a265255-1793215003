import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, History, Trash2 } from "lucide-react";
import { HelpCard } from "@/components/HelpCard";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import type { ConversationItem } from "@/types";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCurrentQuestion(transcript);
          handleAskQuestion(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setError("Sorry, I couldn't hear you clearly. Please try again.");
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      }
    }

    // Load recent conversations from localStorage on mount
    const saved = localStorage.getItem("conversations");
    if (saved) {
      try {
        setConversations(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading conversations:", e);
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const loadHistoryFromSupabase = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const formattedConversations: ConversationItem[] = data.map(item => ({
          question: item.question,
          answer: item.answer,
          timestamp: new Date(item.created_at)
        }));
        setConversations(formattedConversations);
        localStorage.setItem("conversations", JSON.stringify(formattedConversations));
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setError("Couldn't load conversation history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const clearHistory = async () => {
    if (confirm("Are you sure you want to clear all conversation history?")) {
      setConversations([]);
      localStorage.removeItem("conversations");
      // Optionally clear from Supabase too
      try {
        await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (error) {
        console.error("Error clearing Supabase history:", error);
      }
    }
  };

  const startListening = () => {
    setError("");
    setCurrentQuestion("");
    setCurrentAnswer("");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        setError("Could not start listening. Please try again.");
      }
    }
  };

  const handleAskQuestion = async (question: string) => {
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setCurrentAnswer(data.answer);
      
      const newConversation: ConversationItem = {
        question,
        answer: data.answer,
        timestamp: new Date(),
      };
      
      const updatedConversations = [newConversation, ...conversations].slice(0, 20);
      setConversations(updatedConversations);
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));

      speakAnswer(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
      setError("Sorry, I had trouble processing that. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakAnswer = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError("Could not speak the answer");
      };

      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="absolute top-4 right-4">
        <ThemeSwitch />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">
            aworkingbear's Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Click HELP and ask me anything
          </p>
        </div>

        <div className="flex justify-center mb-8 gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory && conversations.length === 0) {
                loadHistoryFromSupabase();
              }
            }}
            className="text-lg"
          >
            <History className="mr-2 h-5 w-5" />
            {showHistory ? "Hide" : "Show"} History
          </Button>
          
          {conversations.length > 0 && (
            <Button
              size="lg"
              variant="outline"
              onClick={clearHistory}
              className="text-lg"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Clear History
            </Button>
          )}
        </div>

        {showHistory && (
          <Card className="p-6 mb-8 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Conversation History</h2>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <p className="font-semibold text-purple-600 mb-1">
                      Q: {conv.question}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                      A: {conv.answer}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(conv.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="flex flex-col items-center gap-8">
          <button
            onClick={startListening}
            disabled={isListening || isProcessing || isSpeaking}
            className={`
              w-64 h-64 rounded-full text-white text-4xl font-bold
              shadow-2xl transform transition-all duration-300
              ${isListening 
                ? "bg-red-500 scale-110 animate-pulse" 
                : isProcessing 
                ? "bg-yellow-500 scale-105" 
                : isSpeaking
                ? "bg-green-500 scale-105 animate-pulse"
                : "bg-purple-600 hover:bg-purple-700 hover:scale-105"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-4 focus:ring-purple-300
            `}
          >
            {isListening ? (
              <div className="flex flex-col items-center gap-2">
                <Mic className="w-16 h-16 animate-pulse" />
                <span className="text-2xl">Listening...</span>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-16 h-16 animate-spin" />
                <span className="text-2xl">Thinking...</span>
              </div>
            ) : isSpeaking ? (
              <div className="flex flex-col items-center gap-2">
                <Volume2 className="w-16 h-16 animate-pulse" />
                <span className="text-2xl">Speaking...</span>
              </div>
            ) : (
              "HELP"
            )}
          </button>

          {isSpeaking && (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopSpeaking}
              className="text-xl px-8 py-6"
            >
              Stop Speaking
            </Button>
          )}

          {error && (
            <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200">
              <p className="text-red-600 dark:text-red-400 text-lg font-semibold text-center">
                {error}
              </p>
            </Card>
          )}

          {currentQuestion && (
            <Card className="p-6 w-full max-w-2xl">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Your Question:
                  </p>
                  <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                    {currentQuestion}
                  </p>
                </div>
                
                {currentAnswer && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Answer:
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentAnswer}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <HelpCard />
        </div>
      </div>
    </div>
  );
}