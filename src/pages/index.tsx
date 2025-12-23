import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, History, Trash2, ShoppingCart, Package, Mail, X, Copy, ArrowLeft } from "lucide-react";
import { HelpCard } from "@/components/HelpCard";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import type { ConversationItem, SavedItem, ShoppingListContent, MovingListContent, EmailDraftContent } from "@/types";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);
  
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
          handleSmartConversation(transcript);
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

    loadSavedItems();

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const loadSavedItems = async () => {
    try {
      const response = await fetch("/api/saved-items");
      const data = await response.json();
      setSavedItems(data.items || []);
    } catch (error) {
      console.error("Error loading saved items:", error);
    }
  };

  const deleteSavedItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await fetch(`/api/saved-items?id=${id}`, {
          method: "DELETE",
        });
        setSavedItems(savedItems.filter(item => item.id !== id));
        if (viewingItem?.id === id) {
          setViewingItem(null);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all conversation history?")) {
      setConversations([]);
      localStorage.removeItem("conversations");
    }
  };

  const startListening = () => {
    setError("");
    
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

  const handleSmartConversation = async (message: string) => {
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message,
          conversationHistory 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setCurrentAnswer(data.response);
      
      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: message },
        { role: "assistant", content: data.response }
      ];
      setConversationHistory(newHistory);

      // Add to local conversation display
      const newConversation: ConversationItem = {
        question: message,
        answer: data.response,
        timestamp: new Date(),
      };
      
      const updatedConversations = [newConversation, ...conversations].slice(0, 20);
      setConversations(updatedConversations);
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));

      // If item was saved, reload the saved items list
      if (data.savedItemId) {
        await loadSavedItems();
        speakAnswer(data.response + " I've saved that for you.");
      } else {
        speakAnswer(data.response);
      }

    } catch (error) {
      console.error("Error in conversation:", error);
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

  const getItemIcon = (type: string) => {
    switch (type) {
      case "shopping":
        return <ShoppingCart className="h-6 w-6" />;
      case "moving":
        return <Package className="h-6 w-6" />;
      case "email":
        return <Mail className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const renderSavedItemView = (item: SavedItem) => {
    if (item.type === "shopping") {
      const content = item.content as ShoppingListContent;
      return (
        <div className="space-y-4">
          {content.items.map((shoppingItem, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xl font-semibold">{shoppingItem.name}</p>
              {shoppingItem.timing && (
                <p className="text-sm text-gray-500 mt-1">When: {shoppingItem.timing}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (item.type === "moving") {
      const content = item.content as MovingListContent;
      return (
        <div className="space-y-4">
          {content.items.map((movingItem, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xl font-semibold mb-2">{movingItem.item}</p>
              {movingItem.recipient && (
                <p className="text-sm text-gray-600 dark:text-gray-400">→ For: {movingItem.recipient}</p>
              )}
              {movingItem.storage && (
                <p className="text-sm text-gray-600 dark:text-gray-400">→ Storage: {movingItem.storage}</p>
              )}
              {movingItem.notes && (
                <p className="text-sm text-gray-500 mt-1">{movingItem.notes}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (item.type === "email") {
      const content = item.content as EmailDraftContent;
      const emailText = `To: ${content.recipient}\nSubject: ${content.subject}\n\n${content.body}`;
      
      return (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">To:</p>
            <p className="text-xl font-semibold mb-3">{content.recipient}</p>
            
            <p className="text-sm text-gray-500 mb-1">Subject:</p>
            <p className="text-lg font-semibold mb-3">{content.subject}</p>
            
            <p className="text-sm text-gray-500 mb-1">Message:</p>
            <p className="text-base leading-relaxed whitespace-pre-wrap">{content.body}</p>
          </div>
          
          <Button
            size="lg"
            onClick={() => copyToClipboard(emailText)}
            className="w-full"
          >
            <Copy className="mr-2 h-5 w-5" />
            Copy Email
          </Button>
        </div>
      );
    }

    return null;
  };

  if (viewingItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="absolute top-4 right-4">
          <ThemeSwitch />
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setViewingItem(null)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>

          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getItemIcon(viewingItem.type)}
                <h1 className="text-3xl font-bold">{viewingItem.title}</h1>
              </div>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => deleteSavedItem(viewingItem.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {renderSavedItemView(viewingItem)}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="absolute top-4 right-4">
        <ThemeSwitch />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">
            Lois's Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Click HELP and ask me anything
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 mb-12">
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
            <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 w-full max-w-2xl">
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
        </div>

        {savedItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Items
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {savedItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setViewingItem(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getItemIcon(item.type)}
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="text-lg"
          >
            <History className="mr-2 h-5 w-5" />
            {showHistory ? "Hide" : "Show"} Chat History
          </Button>
          
          {conversations.length > 0 && (
            <Button
              size="lg"
              variant="outline"
              onClick={clearHistory}
              className="text-lg"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Clear Chat
            </Button>
          )}
        </div>

        {showHistory && conversations.length > 0 && (
          <Card className="p-6 mb-8 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Chat History</h2>
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
          </Card>
        )}

        <HelpCard />
      </div>
    </div>
  );
}