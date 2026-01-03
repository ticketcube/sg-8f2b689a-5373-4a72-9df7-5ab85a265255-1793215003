import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, Trash2, ShoppingCart, Package, Mail, X, Menu, Plus, MessageSquare, LogOut } from "lucide-react";
import { HelpModal } from "@/components/HelpModal";
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentTranscriptRef = useRef<string>("");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && currentUser) {
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
            currentTranscriptRef.current = transcript;
            setCurrentQuestion(transcript);
          } else {
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
    setConversationState("idle");
    setCurrentQuestion("");
    setError("");
    setShowSidebar(false);
  };

  const resumeConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    setConversationState("processing");
    setCurrentQuestion("");
    setError("");
    setShowSidebar(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          message: "__RESUME_CONVERSATION__",
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
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setConversationState("listening");
      } catch (error) {
        console.error("Error starting recognition:", error);
        setError("Could not start listening. Please try again.");
      }
    } else {
      setError("Speech recognition is not available in your browser");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      
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
    if (!activeConversation) {
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
        setConversationState("speaking");
      };
      
      utterance.onend = () => {
        setConversationState("waiting");
      };
      
      utterance.onerror = () => {
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

  const renderMainButton = () => {
    switch (conversationState) {
      case "idle":
        return (
          <button
            onClick={startListening}
            className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-500"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">START</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">TALKING</span>
            </div>
          </button>
        );

      case "listening":
        return (
          <button
            onClick={stopListening}
            className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl transform scale-105 animate-pulse transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            <div className="flex flex-col items-center gap-3">
              <Mic className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 animate-pulse" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">STOP</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">TALKING</span>
            </div>
          </button>
        );

      case "processing":
        return (
          <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-2xl transform scale-105 transition-all duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 animate-spin" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">Thinking...</span>
            </div>
          </div>
        );

      case "speaking":
        return (
          <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl transform scale-105 transition-all duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Volume2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 animate-pulse" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">Speaking...</span>
            </div>
          </div>
        );

      case "waiting":
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Lois's Assistant
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <HelpModal />
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
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Desktop always visible, mobile toggle */}
          <div className={`${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:relative z-30 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-transform duration-300 ease-in-out overflow-y-auto`}>
            <div className="p-4 space-y-4">
              <Button
                size="lg"
                onClick={startNewConversation}
                className="w-full"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Conversation
              </Button>

              <div className="space-y-2">
                {conversations.map((conv) => {
                  const messageCount = Array.isArray(conv.messages) ? conv.messages.length : 0;

                  return (
                    <Card
                      key={conv.id}
                      className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                        activeConversation?.id === conv.id ? "ring-2 ring-purple-500" : ""
                      }`}
                      onClick={() => resumeConversation(conv)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getItemIcon(conv.type)}
                          <h3 className="text-sm font-semibold line-clamp-1">{conv.title}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {messageCount} messages
                        {conv.updated_at && ` • ${new Date(conv.updated_at).toLocaleDateString()}`}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile sidebar overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            {activeConversation && conversationState !== "idle" && (
              <div className="mb-4 text-center">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Current: <span className="font-semibold text-purple-600 dark:text-purple-400">{activeConversation.title}</span>
                </p>
              </div>
            )}

            {/* Main Button Area */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-2xl">
              {renderMainButton()}

              {/* Transcript Display */}
              {conversationState === "listening" && currentQuestion && (
                <Card className="p-4 w-full bg-purple-50 dark:bg-purple-900/20 max-h-32 overflow-y-auto">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic">
                    "{currentQuestion}"
                  </p>
                </Card>
              )}

              {/* Stop Speaking Button */}
              {conversationState === "speaking" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopSpeaking}
                  className="text-sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Stop Speaking
                </Button>
              )}

              {/* Action Buttons */}
              {conversationState === "waiting" && activeConversation && activeConversation.messages.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    size="lg"
                    onClick={startListening}
                    className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                  >
                    <Mic className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    Continue Talking
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={endAndSaveConversation}
                    className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                  >
                    End & Save
                  </Button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 w-full">
                  <p className="text-red-600 dark:text-red-400 text-sm sm:text-base font-semibold text-center">
                    {error}
                  </p>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}