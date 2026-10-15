import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, UserCircle, AlertCircle, Keyboard, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceControls } from "@/components/VoiceControls";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";

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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, []);

  useEffect(() => {
    const { conversation } = router.query;
    if (conversation && typeof conversation === "string" && authToken) {
      loadExistingConversation(conversation);
    }
  }, [router.query, authToken]);

  // Auto-focus input when text mode is enabled
  useEffect(() => {
    if (showTextInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextInput]);

  const loadExistingConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) {
        console.error("Error loading conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        });
        return;
      }

      if (data && data.messages) {
        const formattedMessages: Message[] = data.messages.map((msg: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        
        setMessages(formattedMessages);
        
        toast({
          title: "Conversation Loaded",
          description: `${formattedMessages.length} messages restored`,
        });
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const initializeAuth = async () => {
    try {
      console.log("🔐 Initializing authentication...");
      setIsAuthLoading(true);
      setAuthError(null);

      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log("🔐 Session check:", { 
        hasSession: !!session, 
        hasToken: !!session?.access_token,
        error: error?.message 
      });

      if (error) {
        console.error("🔴 Auth error:", error);
        setAuthError("Authentication error. Please try logging in again.");
        setIsAuthLoading(false);
        return;
      }

      if (!session?.access_token) {
        console.warn("⚠️ No valid session found");
        setAuthError("Please log in to use the assistant.");
        setIsAuthLoading(false);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login?redirect=/chat-senior");
        }, 2000);
        return;
      }

      setAuthToken(session.access_token);
      console.log("✅ Authentication successful");
      setIsAuthLoading(false);
    } catch (error) {
      console.error("🔴 Auth initialization error:", error);
      setAuthError("Failed to initialize authentication");
      setIsAuthLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!authToken) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }

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
      console.log("📤 Sending message to API...");
      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      console.log("📥 API response status:", response.status);

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/auth/login?redirect=/chat-senior");
        }, 1500);
        return;
      }

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
      console.error("🔴 Request error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = async () => {
    // Check for browser speech recognition support (desktop Chrome/Safari)
    const hasWebkitSpeech = "webkitSpeechRecognition" in window;
    
    if (!authToken) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to use voice assistant.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) return;

    // Use browser API if available (desktop)
    if (hasWebkitSpeech) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log("🎤 Voice recording started (browser API)");
        setIsRecording(true);
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("🎤 Voice transcript:", transcript);
        setIsRecording(false);
        await processVoiceMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("🔴 Voice recognition error:", event.error);
        setIsRecording(false);
        toast({
          title: "Error",
          description: "Could not capture voice. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        console.log("🎤 Voice recording ended");
        setIsRecording(false);
      };

      recognition.start();
    } else {
      // Fallback to MediaRecorder + Whisper API (iOS/mobile)
      console.log("🎤 Using MediaRecorder fallback for voice input");
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          console.log("🎤 Recording stopped, processing audio...");
          setIsRecording(false);
          
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          
          // Send to speech-to-text API
          const formData = new FormData();
          formData.append("audio", audioBlob);

          try {
            setIsLoading(true);
            const response = await fetch("/api/speech-to-text", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${authToken}`
              },
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Failed to transcribe audio");
            }

            const data = await response.json();
            const transcript = data.text;
            
            console.log("🎤 Transcription:", transcript);
            
            // Stop the media stream
            stream.getTracks().forEach(track => track.stop());
            
            await processVoiceMessage(transcript);
          } catch (error) {
            console.error("🔴 Transcription error:", error);
            stream.getTracks().forEach(track => track.stop());
            setIsLoading(false);
            toast({
              title: "Error",
              description: "Failed to transcribe audio. Please try again.",
              variant: "destructive",
            });
          }
        };

        mediaRecorder.onerror = (event: any) => {
          console.error("🔴 MediaRecorder error:", event.error);
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
          toast({
            title: "Error",
            description: "Recording failed. Please try again.",
            variant: "destructive",
          });
        };

        setIsRecording(true);
        mediaRecorder.start();
        
        // Auto-stop after 30 seconds (safety timeout)
        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }, 30000);

        // Manual stop - attach to component state for handleStop to use
        (window as any)._currentMediaRecorder = mediaRecorder;
        
      } catch (error) {
        console.error("🔴 getUserMedia error:", error);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      }
    }
  };

  // Extract message processing logic to reuse for both paths
  const processVoiceMessage = async (transcript: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: transcript,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("📤 Sending voice message to API...");
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

      console.log("📥 API response status:", response.status);

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/auth/login?redirect=/chat-senior");
        }, 1500);
        return;
      }

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
      console.error("🔴 Request error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    // Stop browser speech recognition if active
    if (isRecording && (window as any).webkitSpeechRecognition) {
      window.speechSynthesis.cancel();
    }
    
    // Stop MediaRecorder if active
    if ((window as any)._currentMediaRecorder) {
      const recorder = (window as any)._currentMediaRecorder;
      if (recorder.state === "recording") {
        recorder.stop();
      }
      (window as any)._currentMediaRecorder = null;
    }
    
    // Stop text-to-speech
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

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-6">
          <div className="flex gap-3 justify-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-2xl text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-6">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800">Authentication Required</h1>
          <p className="text-2xl text-gray-600">{authError}</p>
          <Button
            onClick={() => router.push("/auth/login?redirect=/chat-senior")}
            size="lg"
            className="text-2xl px-8 py-6"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="lg" 
            className="p-3 sm:p-4"
            onClick={() => router.push("/dashboard")}
          >
            <Menu className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Chat Assistant</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant={showTextInput ? "default" : "outline"}
            size="lg" 
            className="p-3 sm:px-6 sm:py-4"
            onClick={() => setShowTextInput(!showTextInput)}
            title={showTextInput ? "Hide keyboard" : "Show keyboard"}
          >
            <Keyboard className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline ml-2 text-lg">{showTextInput ? "Hide" : "Type"}</span>
          </Button>
          <Button variant="ghost" size="lg" className="p-3 sm:p-4">
            <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-4 sm:py-6 shadow-lg ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : "bg-white text-gray-800 border-2 border-gray-200"
              }`}
            >
              <p className="text-lg sm:text-2xl leading-relaxed">{message.content}</p>
              {mounted && (
                <span className="text-xs sm:text-sm opacity-70 mt-2 sm:mt-3 block">
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
            <div className="bg-white rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-4 sm:py-6 shadow-lg border-2 border-gray-200">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Toggle between Text Input and Voice Controls */}
      <div className="bg-white border-t-4 border-gray-200">
        {showTextInput ? (
          /* Text Input Mode */
          <div className="p-4 sm:p-6">
            <div className="flex gap-2 sm:gap-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="text-lg sm:text-xl h-14 sm:h-16 px-4 sm:px-6 rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg disabled:opacity-50"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline ml-2 text-lg">Send</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Voice Controls Mode */
          <VoiceControls
            onStart={handleVoiceInput}
            onStop={handleStop}
            onHearAgain={handleHearAgain}
            onEndThread={handleEndThread}
          />
        )}
      </div>
    </div>
  );
}