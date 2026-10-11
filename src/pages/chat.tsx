import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Plus, Trash2, LogOut, Bookmark, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { speak } from "@/lib/tts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    const { id } = router.query;
    if (id && typeof id === "string" && conversations.length > 0) {
      loadConversation(id);
    }
  }, [router.query, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setUser(session.user);
    setLoading(false);
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
    if (data && data.length > 0 && !currentConversationId) {
      loadConversation(data[0].id);
    }
  };

  const loadConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages || []);
    }
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "New Conversation",
        messages: [],
        type: "general",
        status: "active"
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return;
    }

    setConversations([data, ...conversations]);
    setCurrentConversationId(data.id);
    setMessages([]);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      return;
    }

    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);

    if (currentConversationId === id) {
      if (updatedConversations.length > 0) {
        loadConversation(updatedConversations[0].id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || sending || !currentConversationId) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: textToSend,
          conversationMessages: messages,
          conversationId: currentConversationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      await supabase
        .from("conversations")
        .update({
          messages: finalMessages,
          title: messages.length === 0 ? textToSend.slice(0, 50) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentConversationId);

      loadConversations();

      if (voiceMode) {
        await speakResponse(data.response, session.access_token);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: error instanceof Error ? error.message : "I apologize, but I encountered an error processing your request. Please try again."
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  async function speakResponse(text: string, accessToken: string) {
    if (isSpeaking) {
      stopSpeaking();
    }

    try {
      setIsSpeaking(true);
      const audio = await speak(text, accessToken, {
        provider: "openai",
        voice: "nova",
        speed: 1.0,
      });

      if (audio instanceof HTMLAudioElement) {
        currentAudioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
    }
  }

  function stopSpeaking() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Microphone access denied or not available");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function transcribeAudio(audioBlob: Blob) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      await sendMessage(data.text);
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio. Please try again.");
    }
  }

  function toggleVoiceMode() {
    if (voiceMode) {
      stopSpeaking();
      if (isRecording) stopRecording();
    }
    setVoiceMode(!voiceMode);
  }

  async function handleSaveMessage(message: any) {
    if (!message.content || isSaving) return;
    
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("saved_items")
      .insert({
        user_id: session.user.id,
        type: "chat",
        title: `Chat: ${message.content.slice(0, 50)}...`,
        content: { 
          message: message.content,
          role: message.role,
          timestamp: message.timestamp 
        },
        metadata: { 
          conversation_id: currentConversationId,
          tags: ["chat", "ai-response"]
        }
      });

    if (!error) {
      alert("Message saved to storage!");
    }
    setIsSaving(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">
            AI Assistant
          </h1>
          <Button
            onClick={createNewConversation}
            className="w-full"
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative p-3 rounded cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-card hover:bg-muted border border-transparent"
                }`}
                onClick={() => loadConversation(conv.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {conv.title || "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 && !voiceMode ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                      How can I assist you?
                    </h2>
                    <p className="text-muted-foreground">
                      Start a conversation with your personal AI assistant
                    </p>
                  </div>
                ) : messages.length === 0 && voiceMode ? (
                  <div className="text-center py-12">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                      isRecording 
                        ? "bg-red-500 animate-pulse" 
                        : isSpeaking 
                        ? "bg-accent animate-pulse"
                        : "bg-muted"
                    }`}>
                      {isRecording ? (
                        <Mic className="w-12 h-12 text-white" />
                      ) : isSpeaking ? (
                        <Volume2 className="w-12 h-12 text-white" />
                      ) : (
                        <Mic className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                      {isRecording ? "Listening..." : isSpeaking ? "Speaking..." : "Voice Mode Active"}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {isRecording 
                        ? "Speak now, then click the button to stop"
                        : isSpeaking
                        ? "Agent is responding..."
                        : "Click the red button to start speaking"
                      }
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <Card
                        className={`max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card"
                        }`}
                      >
                        <CardContent className="p-4">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </CardContent>
                      </Card>
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveMessage(message)}
                          disabled={isSaving}
                          className="self-start mt-2"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-6 bg-muted/30">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    onClick={toggleVoiceMode}
                    variant={voiceMode ? "default" : "outline"}
                    size="sm"
                  >
                    {voiceMode ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Exit Voice Mode
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Voice Mode
                      </>
                    )}
                  </Button>
                  {voiceMode && isSpeaking && (
                    <Button
                      onClick={stopSpeaking}
                      variant="outline"
                      size="sm"
                    >
                      <VolumeX className="w-4 h-4 mr-2" />
                      Stop Speaking
                    </Button>
                  )}
                </div>

                {voiceMode ? (
                  <div className="flex justify-center">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={sending || isSpeaking}
                      size="lg"
                      className={`h-24 w-24 rounded-full ${
                        isRecording 
                          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-10 h-10 text-white" />
                      ) : (
                        <Mic className="w-10 h-10 text-white" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      className="flex-1 min-h-[60px] max-h-[200px] resize-none"
                      disabled={sending}
                    />
                    <Button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || sending}
                      size="lg"
                      className="h-[60px] px-6"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                No Conversation Selected
              </h2>
              <p className="text-muted-foreground mb-6">
                Create a new conversation to get started
              </p>
              <Button onClick={createNewConversation}>
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}