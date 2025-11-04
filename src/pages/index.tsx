
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, MessageCircle } from "lucide-react";

export default function HomePage() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState<Array<{question: string, answer: string, timestamp: Date}>>([]);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            handleQuestion(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleQuestion = async (question: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await response.json();
      
      setConversation(prev => [{
        question,
        answer: data.answer,
        timestamp: new Date()
      }, ...prev]);

      speakAnswer(data.answer);
      setTranscript("");
    } catch (error) {
      console.error("Error getting answer:", error);
      const errorMsg = "I'm sorry, I had trouble getting an answer. Please try again.";
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
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            Lois's Assistant
          </h1>
          <p className="text-xl text-gray-600">Ask me anything, anytime</p>
        </header>

        <div className="flex flex-col items-center gap-6 mb-8">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-48 h-48 rounded-full text-2xl font-bold shadow-2xl transition-all duration-300 ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse" 
                : isProcessing
                ? "bg-blue-500"
                : "bg-emerald-500 hover:bg-emerald-600 hover:scale-105"
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-16 h-16 animate-spin" />
                <span className="text-lg">Thinking...</span>
              </div>
            ) : isListening ? (
              <div className="flex flex-col items-center gap-3">
                <Mic className="w-16 h-16" />
                <span className="text-lg">Listening...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <MessageCircle className="w-16 h-16" />
                <span className="text-lg">HELP</span>
              </div>
            )}
          </Button>

          {transcript && (
            <Card className="p-6 w-full max-w-2xl bg-white/90 backdrop-blur">
              <p className="text-xl text-gray-700">
                <strong>You said:</strong> {transcript}
              </p>
            </Card>
          )}

          {isSpeaking && (
            <div className="flex items-center gap-3 text-blue-600">
              <Volume2 className="w-8 h-8 animate-pulse" />
              <span className="text-xl font-medium">Speaking answer...</span>
            </div>
          )}
        </div>

        {conversation.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Conversations</h2>
            {conversation.map((item, index) => (
              <Card key={index} className="p-6 bg-white/90 backdrop-blur">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">{formatTime(item.timestamp)}</span>
                    </div>
                    <p className="text-lg text-gray-700 mb-2">
                      <strong className="text-emerald-600">Question:</strong> {item.question}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-lg text-gray-800 leading-relaxed">
                      <strong className="text-blue-600">Answer:</strong> {item.answer}
                    </p>
                  </div>
                  <Button
                    onClick={() => speakAnswer(item.answer)}
                    variant="outline"
                    className="mt-2"
                    disabled={isSpeaking}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Repeat Answer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
