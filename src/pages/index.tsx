import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, Trash2, ShoppingCart, Package, Mail, X, Copy, ArrowLeft, Edit2, Plus, MessageSquare } from "lucide-react";
import { HelpCard } from "@/components/HelpCard";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import type { SavedItem, ShoppingListContent, MovingListContent, EmailDraftContent, Conversation, Message } from "@/types";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [error, setError] = useState("");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);
  
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversationMode, setConversationMode] = useState<"idle" | "active" | "ending" | "saving" | "editing_title">("idle");
  const [showSidebar, setShowSidebar] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;  // Keep listening
        recognitionRef.current.interimResults = true;  // Show partial results
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log("🎤 Speech recognition STARTED");
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          console.log("🎤 Speech detected! Event:", event);
          
          // Get the most recent result
          const resultIndex = event.resultIndex;
          const result = event.results[resultIndex];
          
          console.log("Result details:", {
            isFinal: result.isFinal,
            confidence: result[0].confidence,
            transcript: result[0].transcript
          });

          // Only process final results
          if (result.isFinal) {
            const transcript = result[0].transcript;
            console.log("✅ Final transcript:", transcript);
            
            // Stop listening after getting final result
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            
            setCurrentQuestion(transcript);
            handleConversationMessage(transcript);
          } else {
            console.log("⏳ Interim result:", result[0].transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("❌ Speech recognition error:", event.error);
          console.error("Error details:", event);
          
          let errorMessage = "Sorry, I couldn't hear you clearly. ";
          
          switch(event.error) {
            case 'no-speech':
              errorMessage += "No speech detected. Please try again and speak clearly.";
              break;
            case 'audio-capture':
              errorMessage += "Microphone not accessible. Check permissions.";
              break;
            case 'not-allowed':
              errorMessage += "Microphone permission denied. Please allow access.";
              break;
            case 'network':
              errorMessage += "Network error. Check your connection.";
              break;
            default:
              errorMessage += `Error: ${event.error}`;
          }
          
          setError(errorMessage);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          console.log("🛑 Speech recognition ended");
          setIsListening(false);
        };

        recognitionRef.current.onspeechstart = () => {
          console.log("🗣️ Speech detected - user is speaking!");
        };

        recognitionRef.current.onspeechend = () => {
          console.log("🤫 Speech ended - user stopped speaking");
        };

        recognitionRef.current.onaudiostart = () => {
          console.log("🔊 Audio capture started");
        };

        recognitionRef.current.onaudioend = () => {
          console.log("🔇 Audio capture ended");
        };
      } else {
        setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      }
    }

    loadSavedItems();
    loadConversations();

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

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const startNewConversation = () => {
    console.log("🆕 Starting new conversation...");
    const newConv: Conversation = {
      id: `temp-${Date.now()}`,
      title: "New Conversation",
      messages: [],
      type: "general" as const,
      status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setActiveConversation(newConv);
    setConversationMode("active");
    console.log("✅ New conversation created and set as active:", newConv);
  };

  const resumeConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setConversationMode("active");
    setCurrentQuestion("");
    setCurrentAnswer("");
    setError("");
  };

  const testMicrophone = () => {
    if (!recognitionRef.current) {
      alert("❌ Speech recognition not initialized!\n\nYour browser might not support it.\nPlease use Chrome or Edge.");
      return;
    }
    
    alert("✅ Microphone setup is ready!\n\n" +
          "Speech recognition is initialized and ready to use.\n" +
          "Make sure to:\n" +
          "1. Allow microphone permissions\n" +
          "2. Speak clearly and loud enough\n" +
          "3. Check browser console for detailed logs");
  };

  const startListening = () => {
    if (conversationMode === "idle") {
      setError("Please start a new conversation first");
      return;
    }

    setError("");
    console.log("Starting voice recognition...");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("Voice recognition started successfully");
      } catch (error) {
        console.error("Error starting recognition:", error);
        setError("Could not start listening. Please try again.");
      }
    } else {
      console.error("Speech recognition not initialized");
      setError("Speech recognition is not available in your browser");
    }
  };

  const handleConversationMessage = async (message: string) => {
    console.log("📝 handleConversationMessage called with:", message);
    console.log("📋 Current activeConversation:", activeConversation);
    console.log("🎯 Current conversationMode:", conversationMode);

    // Validate conversation state - if no active conversation, create one
    if (!activeConversation) {
      console.log("⚠️ No active conversation found, creating new one...");
      const newConversation: Conversation = {
        id: `temp-${Date.now()}`,
        title: "New Conversation",
        messages: [],
        type: "general" as const,
        status: "active" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setActiveConversation(newConversation);
      setConversationMode("active");
      console.log("✅ Created new conversation:", newConversation);
      // Re-run this function with the new conversation
      setTimeout(() => handleConversationMessage(message), 100);
      return;
    }

    if (conversationMode !== "active") {
      console.log("⚠️ Conversation mode is not active, setting to active...");
      setConversationMode("active");
    }

    console.log("🚀 Starting conversation message processing...");

    setIsProcessing(true);

    try {
      // Add user message to conversation
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      const updatedMessages = [...activeConversation.messages, userMessage];
      console.log("💬 Updated messages array:", updatedMessages);

      setActiveConversation((prev) => ({
        ...prev,
        messages: updatedMessages,
      }));

      console.log("📡 Preparing API call to /api/smart-conversation");
      console.log("📦 API Request body:", {
        message,
        conversationId: activeConversation.id !== "temp" ? activeConversation.id : null,
        existingMessages: activeConversation.messages,
        conversationType: activeConversation.type,
        userIsDone: false,
      });

      // Call smart conversation API
      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId: activeConversation.id !== "temp" ? activeConversation.id : null,
          existingMessages: activeConversation.messages,
          conversationType: activeConversation.type,
          userIsDone: false,
        }),
      });

      console.log("📬 API Response status:", response.status);
      console.log("📬 API Response OK:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error response:", errorData);
        throw new Error(errorData.error || "Failed to process message");
      }

      const data = await response.json();
      console.log("✅ API Response data:", data);
      console.log("🆔 Conversation ID from API:", data.conversationId);
      console.log("📝 Title from API:", data.title);
      console.log("💬 Messages from API:", data.messages);

      // Add assistant response to conversation
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      console.log("📚 Final messages array:", finalMessages);

      // Update conversation with response and save to database
      const updatedConversation = {
        ...activeConversation,
        id: data.conversationId || activeConversation.id,
        title: data.title || activeConversation.title,
        messages: data.messages || finalMessages,
        type: data.conversationType || activeConversation.type,
        updated_at: new Date().toISOString(),
      };

      console.log("🔄 Setting active conversation to:", updatedConversation);
      setActiveConversation(updatedConversation);

      console.log("🔃 Reloading conversations list...");
      await loadConversations();
      console.log("✅ Conversations list reloaded");

      // Speak the response
      if (data.response) {
        console.log("🔊 Speaking response:", data.response.substring(0, 50) + "...");
        speakAnswer(data.response);
      }
    } catch (error: any) {
      console.error("❌ Error in handleConversationMessage:", error);
      console.error("❌ Error stack:", error.stack);
      setError("Sorry, I had trouble processing that. Please try again.");
    } finally {
      console.log("🏁 Processing complete, setting isProcessing to false");
      setIsProcessing(false);
    }
  };

  const saveConversationToDatabase = async (conversation: Conversation) => {
    try {
      const isNewConversation = conversation.id.startsWith("temp-");
      
      if (isNewConversation) {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: conversation.title,
            messages: conversation.messages,
            type: conversation.type,
            status: "saved",
          }),
        });
        const data = await response.json();
        await loadConversations();
        return data.conversation;
      } else {
        const response = await fetch("/api/conversations", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: conversation.id,
            title: conversation.title,
            messages: conversation.messages,
            status: "saved",
          }),
        });
        const data = await response.json();
        await loadConversations();
        return data.conversation;
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
      throw error;
    }
  };

  const deleteConversation = async (id: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await fetch(`/api/conversations?id=${id}`, {
          method: "DELETE",
        });
        await loadConversations();
        if (activeConversation?.id === id) {
          setActiveConversation(null);
          setConversationMode("idle");
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const speakAnswer = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsProcessing(false);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsProcessing(false);
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

  const endAndSaveConversation = () => {
    setConversationMode("saving");
    speakAnswer(`Should I save this conversation as "${activeConversation?.title}"?`);
  };

  const startEditingTitle = () => {
    setConversationMode("editing_title");
    speakAnswer("What would you like to call this conversation?");
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

  const getItemIcon = (type: string) => {
    switch (type) {
      case "shopping":
        return <ShoppingCart className="h-5 w-5" />;
      case "moving":
        return <Package className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
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

      <div className="flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Conversations</h2>
              
              {/* OpenAI Test Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test-openai');
                    const data = await response.json();
                    if (data.success) {
                      alert(`✅ OpenAI is working!\n\nResponse: ${data.response}\nModel: ${data.model}`);
                    } else {
                      alert(`❌ OpenAI Error:\n\n${data.error}\n\n${data.details || ''}`);
                    }
                  } catch (error) {
                    alert('❌ Failed to test OpenAI API');
                  }
                }}
                className="w-full mb-4 text-sm"
              >
                🧪 Test OpenAI API
              </Button>
              
              <Button
                size="lg"
                onClick={startNewConversation}
                className="w-full mb-6 text-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Conversation
              </Button>

              {/* Microphone Test Button */}
              <Button
                size="lg"
                variant="outline"
                onClick={testMicrophone}
                className="w-full mb-4 text-sm"
              >
                🎤 Test Microphone Setup
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/test-save", {
                      method: "POST",
                    });
                    const data = await response.json();
                    if (data.success) {
                      alert(`✅ Database save works! Conversation ID: ${data.conversationId}`);
                      await loadConversations();
                    } else {
                      alert(`❌ Database save failed: ${data.error}`);
                    }
                  } catch (error: any) {
                    alert(`❌ Test failed: ${error.message}`);
                  }
                }}
                className="w-full mb-4 text-sm"
              >
                💾 Test Database Save
              </Button>

              <div className="space-y-2">
                {conversations.map((conv) => {
                  const messageCount = Array.isArray(conv.messages)
                    ? conv.messages.length
                    : 0;

                  return (
                    <Card
                      key={conv.id}
                      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        activeConversation?.id === conv.id ? "ring-2 ring-purple-500" : ""
                      }`}
                      onClick={() => resumeConversation(conv)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getItemIcon(conv.type)}
                          <h3 className="text-lg font-semibold line-clamp-1">{conv.title}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {messageCount} messages{" "}
                        {conv.updated_at
                          ? `• ${new Date(conv.updated_at).toLocaleDateString()}`
                          : ""}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">
                Lois's Assistant
              </h1>
              {activeConversation && conversationMode !== "idle" && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <p className="text-xl text-gray-600 dark:text-gray-300">
                    Current: <span className="font-semibold text-purple-600 dark:text-purple-400">{activeConversation.title}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditingTitle}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-8 mb-12">
              <button
                onClick={startListening}
                disabled={isListening || isProcessing || isSpeaking || conversationMode === "idle"}
                className={`
                  w-64 h-64 rounded-full text-white text-4xl font-bold
                  shadow-2xl transform transition-all duration-300
                  ${isListening 
                    ? "bg-red-500 scale-110 animate-pulse" 
                    : isProcessing 
                    ? "bg-yellow-500 scale-105" 
                    : isSpeaking
                    ? "bg-green-500 scale-105 animate-pulse"
                    : conversationMode === "idle"
                    ? "bg-gray-400 cursor-not-allowed"
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
                ) : conversationMode === "idle" ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">Start New</span>
                    <span className="text-2xl">Conversation</span>
                  </div>
                ) : (
                  "HELP"
                )}
              </button>

              {conversationMode === "active" && activeConversation && activeConversation.messages.length > 0 && (
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={startListening}
                    disabled={isListening || isProcessing || isSpeaking}
                    className="text-xl px-8 py-6"
                  >
                    Continue
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={endAndSaveConversation}
                    className="text-xl px-8 py-6"
                  >
                    End & Save
                  </Button>
                </div>
              )}

              {isSpeaking && (
                <Button
                  size="lg"
                  variant="outline"
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

              {activeConversation &&
                Array.isArray(activeConversation.messages) &&
                activeConversation.messages.length > 0 && (
                  <Card className="p-6 w-full max-w-2xl">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {activeConversation.messages.map((msg, index) => (
                        <div key={index} className={msg.role === "user" ? "text-right" : "text-left"}>
                          <div
                            className={`inline-block p-4 rounded-lg ${
                              msg.role === "user"
                                ? "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            <p className="text-lg">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
            </div>

            {savedItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Saved Items
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

            <HelpCard />
          </div>
        </div>
      </div>
    </div>
  );
}