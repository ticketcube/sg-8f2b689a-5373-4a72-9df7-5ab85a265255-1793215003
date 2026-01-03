import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, Trash2, ShoppingCart, Package, Mail, X, Copy, ArrowLeft, Edit2, Plus, MessageSquare, LogOut, User } from "lucide-react";
import { HelpCard } from "@/components/HelpCard";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import type { SavedItem, ShoppingListContent, MovingListContent, EmailDraftContent, Conversation, Message } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

type ConversationState = "idle" | "listening" | "processing" | "speaking" | "waiting";

export default function Home() {
  const router = useRouter();
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [error, setError] = useState("");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentTranscriptRef = useRef<string>("");

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("👤 Current user loaded:", session.user.id);
        setCurrentUser(session.user);
      } else {
        console.log("⚠️ No user session found");
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && currentUser) {
      console.log("🎤 Initializing speech recognition for user:", currentUser.id);
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log("🎤 Speech recognition STARTED");
        };

        recognitionRef.current.onresult = (event: any) => {
          const resultIndex = event.resultIndex;
          const result = event.results[resultIndex];

          if (result.isFinal) {
            const transcript = result[0].transcript;
            console.log("✅ Final transcript:", transcript);
            currentTranscriptRef.current = transcript;
            setCurrentQuestion(transcript);
          } else {
            console.log("⏳ Interim result:", result[0].transcript);
            setCurrentQuestion(result[0].transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("❌ Speech recognition error:", event.error);
          
          let errorMessage = "Sorry, I couldn't hear you clearly. ";
          
          switch(event.error) {
            case "no-speech":
              errorMessage += "No speech detected. Please try again and speak clearly.";
              break;
            case "audio-capture":
              errorMessage += "Microphone not accessible. Check permissions.";
              break;
            case "not-allowed":
              errorMessage += "Microphone permission denied. Please allow access.";
              break;
            case "network":
              errorMessage += "Network error. Check your connection.";
              break;
            default:
              errorMessage += `Error: ${event.error}`;
          }
          
          setError(errorMessage);
          setConversationState("waiting");
        };

        recognitionRef.current.onend = () => {
          console.log("🛑 Speech recognition ended");
        };
      } else {
        setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      }
    }

    if (currentUser) {
      loadSavedItems();
      loadConversations();
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }
    };
  }, [currentUser]);

  const loadSavedItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/saved-items", {
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();
      setSavedItems(data.items || []);
    } catch (error) {
      console.error("Error loading saved items:", error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/conversations", {
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getUserInitials = () => {
    if (!currentUser) return "?";
    
    const displayName = currentUser.user_metadata?.full_name || currentUser.email;
    if (!displayName) return "?";
    
    const names = displayName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!currentUser) return "User";
    return currentUser.user_metadata?.full_name || currentUser.email || "User";
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
    console.log("✅ New conversation created:", newConv);
    setActiveConversation(newConv);
    setConversationState("idle");
    setCurrentQuestion("");
    setError("");
  };

  const resumeConversation = async (conversation: Conversation) => {
    console.log("▶️ Resuming conversation:", conversation.id);
    setActiveConversation(conversation);
    setConversationState("processing");
    setCurrentQuestion("");
    setError("");

    // Send proactive greeting based on conversation type
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          message: "__RESUME_CONVERSATION__", // Special flag for API
          conversationId: conversation.id,
          existingMessages: conversation.messages,
          conversationType: conversation.type,
          userIsDone: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to resume conversation");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, assistantMessage],
        updated_at: new Date().toISOString(),
      };

      setActiveConversation(updatedConversation);
      speakAnswer(data.response);
      setConversationState("waiting");
    } catch (error) {
      console.error("Error resuming conversation:", error);
      setError("Failed to resume conversation");
      setConversationState("waiting");
    }
  };

  const startListening = () => {
    if (conversationState === "idle" && !activeConversation) {
      setError("Please start a new conversation first");
      return;
    }

    setError("");
    setCurrentQuestion("");
    currentTranscriptRef.current = "";
    console.log("🎤 Starting voice recognition...");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setConversationState("listening");
        console.log("✅ Voice recognition started");
      } catch (error) {
        console.error("Error starting recognition:", error);
        setError("Could not start listening. Please try again.");
      }
    } else {
      console.error("Speech recognition not initialized");
      setError("Speech recognition is not available in your browser");
    }
  };

  const stopListening = () => {
    console.log("🛑 Stopping voice recognition...");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("✅ Voice recognition stopped");
      
      // Process the captured transcript
      const finalTranscript = currentTranscriptRef.current;
      if (finalTranscript.trim()) {
        handleConversationMessage(finalTranscript);
      } else {
        setError("No speech detected. Please try again.");
        setConversationState("waiting");
      }
    }
  };

  const handleConversationMessage = async (message: string) => {
    console.log("📝 Processing message:", message);
    
    if (!activeConversation) {
      console.error("❌ No active conversation");
      return;
    }

    setConversationState("processing");

    try {
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      const updatedMessages = [...activeConversation.messages, userMessage];

      const updatedConversation = {
        ...activeConversation,
        messages: updatedMessages,
      };

      setActiveConversation(updatedConversation);

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          message,
          conversationId: activeConversation.id.startsWith("temp-") ? null : activeConversation.id,
          existingMessages: activeConversation.messages,
          conversationType: activeConversation.type,
          userIsDone: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process message");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      const finalConversation = {
        ...activeConversation,
        id: data.conversationId || activeConversation.id,
        title: data.title || activeConversation.title,
        messages: data.messages || finalMessages,
        type: data.conversationType || activeConversation.type,
        updated_at: new Date().toISOString(),
      };

      setActiveConversation(finalConversation);
      await loadConversations();

      if (data.response) {
        speakAnswer(data.response);
      } else {
        setConversationState("waiting");
      }
    } catch (error: any) {
      console.error("❌ Error processing message:", error);
      setError("Sorry, I had trouble processing that. Please try again.");
      setConversationState("waiting");
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
        console.log("🔊 Started speaking");
        setConversationState("speaking");
      };
      
      utterance.onend = () => {
        console.log("🔇 Finished speaking");
        setConversationState("waiting");
      };
      
      utterance.onerror = () => {
        console.error("❌ Speech synthesis error");
        setConversationState("waiting");
        setError("Could not speak the answer");
      };

      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setConversationState("waiting");
    }
  };

  const endAndSaveConversation = async () => {
    if (!activeConversation) return;

    try {
      setConversationState("processing");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const isNewConversation = activeConversation.id.startsWith("temp-");
      
      if (isNewConversation) {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            title: activeConversation.title,
            messages: activeConversation.messages,
            type: activeConversation.type,
            status: "saved",
          }),
        });
        await response.json();
      } else {
        const response = await fetch("/api/conversations", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            id: activeConversation.id,
            title: activeConversation.title,
            messages: activeConversation.messages,
            status: "saved",
          }),
        });
        await response.json();
      }
      
      await loadConversations();
      
      // Reset to idle state
      setActiveConversation(null);
      setConversationState("idle");
      setCurrentQuestion("");
      
      speakAnswer("Conversation saved successfully!");
    } catch (error) {
      console.error("Error saving conversation:", error);
      setError("Failed to save conversation");
      setConversationState("waiting");
    }
  };

  const deleteConversation = async (id: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/conversations?id=${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
          },
        });
        await loadConversations();
        if (activeConversation?.id === id) {
          setActiveConversation(null);
          setConversationState("idle");
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const deleteSavedItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/saved-items?id=${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
          },
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
      case "inventory":
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

  const renderMainButton = () => {
    switch (conversationState) {
      case "idle":
        return (
          <button
            onClick={startListening}
            className="w-64 h-64 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-4xl font-bold shadow-2xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">START</span>
              <span className="text-3xl">TALKING</span>
            </div>
          </button>
        );

      case "listening":
        return (
          <button
            onClick={stopListening}
            className="w-64 h-64 rounded-full bg-red-500 text-white text-4xl font-bold shadow-2xl transform scale-110 animate-pulse transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            <div className="flex flex-col items-center gap-2">
              <Mic className="w-16 h-16 animate-pulse" />
              <span className="text-2xl">STOP</span>
              <span className="text-2xl">TALKING</span>
            </div>
          </button>
        );

      case "processing":
        return (
          <div className="w-64 h-64 rounded-full bg-yellow-500 text-white text-4xl font-bold shadow-2xl transform scale-105 transition-all duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-16 h-16 animate-spin" />
              <span className="text-2xl">Thinking...</span>
            </div>
          </div>
        );

      case "speaking":
        return (
          <div className="w-64 h-64 rounded-full bg-green-500 text-white text-4xl font-bold shadow-2xl transform scale-105 transition-all duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Volume2 className="w-16 h-16 animate-pulse" />
              <span className="text-2xl">Speaking...</span>
            </div>
          </div>
        );

      case "waiting":
        return null; // Show action buttons instead
    }
  };

  if (viewingItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeSwitch />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeSwitch />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex h-screen">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Conversations</h2>
                
                <Button
                  size="lg"
                  onClick={startNewConversation}
                  className="w-full mb-6 text-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  New Conversation
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
                {activeConversation && conversationState !== "idle" && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      Current: <span className="font-semibold text-purple-600 dark:text-purple-400">{activeConversation.title}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-8 mb-12">
                {/* Main Button */}
                {renderMainButton()}

                {/* Interim Speech Display */}
                {conversationState === "listening" && currentQuestion && (
                  <Card className="p-6 w-full max-w-2xl bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-lg text-gray-700 dark:text-gray-300 italic">
                      "{currentQuestion}"
                    </p>
                  </Card>
                )}

                {/* Stop Speaking Button (small, during AI speech) */}
                {conversationState === "speaking" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopSpeaking}
                    className="text-sm px-4 py-2"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Stop Speaking
                  </Button>
                )}

                {/* Action Buttons (Continue or End) */}
                {conversationState === "waiting" && activeConversation && activeConversation.messages.length > 0 && (
                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      onClick={startListening}
                      className="text-xl px-8 py-6"
                    >
                      <Mic className="mr-2 h-6 w-6" />
                      Continue Talking
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

                {/* Error Display */}
                {error && (
                  <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 w-full max-w-2xl">
                    <p className="text-red-600 dark:text-red-400 text-lg font-semibold text-center">
                      {error}
                    </p>
                  </Card>
                )}

                {/* Conversation Messages */}
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
    </ProtectedRoute>
  );
}