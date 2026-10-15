import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Mic, MicOff, Volume2, VolumeX, ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { speak } from "@/lib/tts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatSimplePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
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
    checkUserAndCreateConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkUserAndCreateConversation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setUser(session.user);

    // Check if conversation ID is in URL, otherwise create new one
    const { id } = router.query;
    if (id && typeof id === "string") {
      await loadConversation(id);
    } else {
      await createNewConversation(session.user.id);
    }
    
    setLoading(false);
  };

  const createNewConversation = async (userId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: "New Conversation",
        messages: [],
        type: "general",
        status: "saved"
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return;
    }

    setConversationId(data.id);
    router.replace(`/chat-simple?id=${data.id}`, undefined, { shallow: true });
  };

  const loadConversation = async (id: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading conversation:", error);
      return;
    }

    setConversationId(id);
    // Parse messages from Json type
    const messagesData = data.messages;
    if (Array.isArray(messagesData)) {
      setMessages(messagesData as Message[]);
    } else {
      setMessages([]);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || sending || !conversationId) return;

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
          conversationId: conversationId
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
          messages: finalMessages as any, // Cast to any for Json type compatibility
          title: messages.length === 0 ? textToSend.slice(0, 50) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Minimal Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-lg font-serif font-semibold text-foreground">
          AI Assistant
        </h1>
        <div className="w-24"></div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !voiceMode ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
                How can I assist you?
              </h2>
              <p className="text-muted-foreground">
                Ask me anything - I can help with recipes, reminders, shopping lists, and more
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
                <div className={`flex items-start gap-2 max-w-[85%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}>
                  <Card
                    className={`${
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
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      {/* Input Area */}
      <div className="px-4 py-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={toggleVoiceMode}
              variant={voiceMode ? "default" : "outline"}
              size="sm"
            >
              {voiceMode ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Exit Voice
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
            <div className="flex justify-center py-4">
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
    </div>
  );
}