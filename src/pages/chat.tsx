import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  type?: string;
}

export default function ChatHistory() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && authToken) {
      loadConversations();
    }
  }, [user, authToken]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login?redirect=/chat");
      return;
    }
    setUser(session.user);
    setAuthToken(session.access_token);
    setLoading(false);
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      return;
    }

    // Parse conversations with proper Json handling
    const parsedConversations = (data || []).map(conv => ({
      ...conv,
      messages: Array.isArray(conv.messages) ? conv.messages as Message[] : []
    }));

    setConversations(parsedConversations);
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmed = window.confirm("Delete this conversation?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deleted",
      description: "Conversation removed",
    });
    
    loadConversations();
  };

  const openConversation = (id: string) => {
    router.push(`/chat-senior?conversation=${id}`);
  };

  const createNewChat = () => {
    router.push("/chat-senior");
  };

  const getConversationPreview = (messages: Message[]) => {
    if (!messages || messages.length === 0) return "No messages yet";
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? "..." : "");
  };

  const getMessageCount = (messages: Message[]) => {
    if (!messages) return 0;
    return messages.length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-6">
          <div className="flex gap-3 justify-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-2xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              className="p-4"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-8 h-8 text-gray-700" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Chat History</h1>
          </div>
          <Button
            onClick={createNewChat}
            size="lg"
            className="px-8 py-6 text-2xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Plus className="w-6 h-6 mr-3" />
            New Chat
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-700 mb-4">No Conversations Yet</h2>
            <p className="text-2xl text-gray-600 mb-8">Start your first chat with the AI assistant</p>
            <Button
              onClick={createNewChat}
              size="lg"
              className="px-10 py-8 text-2xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Plus className="w-6 h-6 mr-3" />
              Start Chatting
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid gap-6">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="p-8 cursor-pointer hover:shadow-xl transition-all duration-200 bg-white border-4 border-gray-200 hover:border-blue-400"
                  onClick={() => openConversation(conv.id)}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <MessageSquare className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <h3 className="text-2xl font-bold text-gray-800 truncate">
                          {conv.title || "Untitled Conversation"}
                        </h3>
                      </div>
                      
                      <p className="text-xl text-gray-600 mb-4 line-clamp-2">
                        {getConversationPreview(conv.messages)}
                      </p>
                      
                      <div className="flex items-center gap-6 text-lg text-gray-500">
                        <span className="font-semibold">
                          {getMessageCount(conv.messages)} messages
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(conv.updated_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(conv.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="lg"
                      className="p-4 hover:bg-red-100"
                      onClick={(e) => deleteConversation(conv.id, e)}
                    >
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}