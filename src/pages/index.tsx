import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, MessageCircle, Trash2, AlertCircle } from "lucide-react";
import { HelpCard } from "@/components/HelpCard";

interface ConversationItem {
  question: string;
  answer: string;
  timestamp: Date;
}

export default function HomePage() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setBrowserSupported(false);
        setError("Voice recognition not supported. Please use Chrome or Edge browser.");
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        transcriptRef.current = transcriptText;
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        const finalTranscript = transcriptRef.current.trim();
        if (finalTranscript) {
          handleQuestion(finalTranscript);
        }
        transcriptRef.current = "";
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "no-speech") {
          setError("No speech detected. Please try again.");
        } else if (event.error === "not-allowed") {
          setError("Microphone permission denied. Please allow microphone access.");
        } else {
          setError("Voice recognition error. Please try again.");
        }
        setTimeout(() => setError(null), 5000);
      };

      const savedConversations = localStorage.getItem("aworkingbear-conversations");
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          setConversation(parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })));
        } catch (e) {
          console.error("Error loading saved conversations:", e);
        }
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (conversation.length > 0) {
      localStorage.setItem("aworkingbear-conversations", JSON.stringify(conversation.slice(0, 10)));
    }
  }, [conversation]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isProcessing && browserSupported) {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isListening, isProcessing, browserSupported]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Voice recognition not available.");
      return;
    }
    
    setError(null);
    setTranscript("");
    transcriptRef.current = "";
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Error starting recognition:", e);
      setIsListening(false);
      setError("Could not start voice recognition. Please try again.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleQuestion = async (question: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      
      const newItem: ConversationItem = {
        question,
        answer: data.answer,
        timestamp: new Date()
      };
      
      setConversation(prev => [newItem, ...prev]);
      speakAnswer(data.answer);
      setTranscript("");
    } catch (error) {
      console.error("Error getting answer:", error);
      const errorMsg = "I'm sorry, I had trouble getting an answer. Please try again.";
      setError(errorMsg);
      speakAnswer(errorMsg);
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
      utterance.lang = "en-US";
      
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes("Male") || voice.name.includes("Google US English")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all conversation history?")) {
      setConversation([]);
      localStorage.removeItem("aworkingbear-conversations");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-2">
            aworkingbear's Assistant
          </h1>
          <p className="text-xl sm:text-2xl text-blue-200">Your AI-powered personal assistant</p>
        </header>

        <div className="mb-8">
          <HelpCard />
        </div>

        {!browserSupported && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">Browser Not Supported</h3>
                <p className="text-red-800">
                  Please use Google Chrome or Microsoft Edge for the best experience with voice recognition.
                </p>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-lg text-yellow-900">{error}</p>
            </div>
          </Card>
        )}

        <div className="flex flex-col items-center gap-6 mb-12">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || !browserSupported}
            className={`w-56 h-56 sm:w-64 sm:h-64 rounded-full text-3xl font-bold shadow-2xl transition-all duration-300 ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse" 
                : isProcessing
                ? "bg-blue-500"
                : "bg-emerald-500 hover:bg-emerald-600 hover:scale-105"
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-20 h-20 animate-spin" />
                <span className="text-xl">Thinking...</span>
              </div>
            ) : isListening ? (
              <div className="flex flex-col items-center gap-4">
                <Mic className="w-20 h-20" />
                <span className="text-xl">Listening...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <MessageCircle className="w-20 h-20" />
                <span className="text-2xl">HELP</span>
              </div>
            )}
          </Button>

          <p className="text-lg text-blue-100 text-center max-w-md">
            {isListening 
              ? "I'm listening... speak your question now" 
              : isProcessing 
              ? "Getting your answer..."
              : "Press the button and ask your question"}
          </p>

          {transcript && (
            <Card className="p-6 w-full max-w-2xl bg-white/90 backdrop-blur shadow-lg">
              <p className="text-2xl text-gray-700">
                <strong className="text-emerald-600">You said:</strong> {transcript}
              </p>
            </Card>
          )}

          {isSpeaking && (
            <div className="flex items-center gap-3 text-blue-100 bg-blue-600/50 backdrop-blur px-6 py-3 rounded-full">
              <Volume2 className="w-8 h-8 animate-pulse" />
              <span className="text-xl font-medium">Speaking answer...</span>
            </div>
          )}
        </div>

        {conversation.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Recent Conversations</h2>
              <Button
                onClick={clearHistory}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </div>
            {conversation.map((item, index) => (
              <Card key={index} className="p-6 sm:p-8 bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl text-gray-700 mb-2">
                      <strong className="text-emerald-600">Q:</strong> {item.question}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed">
                      <strong className="text-blue-600">A:</strong> {item.answer}
                    </p>
                  </div>
                  <Button
                    onClick={() => speakAnswer(item.answer)}
                    variant="outline"
                    size="lg"
                    className="mt-4 text-lg"
                    disabled={isSpeaking}
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Repeat Answer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {conversation.length === 0 && !isListening && !isProcessing && (
          <Card className="p-8 bg-white/80 backdrop-blur text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No conversations yet
            </h3>
            <p className="text-xl text-gray-600">
              Press the HELP button above to ask your first question!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}