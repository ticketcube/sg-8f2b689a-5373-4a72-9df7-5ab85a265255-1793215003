import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, ShoppingCart, Package, Mail, X, Menu, Plus, MessageSquare, LogOut, Pencil, Check, Send } from "lucide-react";
import { HelpModal } from "@/components/HelpModal";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { InventoryTable } from "@/components/InventoryTable";
import { ShoppingListTable } from "@/components/ShoppingListTable";
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentInventoryItems, setCurrentInventoryItems] = useState<any[]>([]);
  const [currentShoppingItems, setCurrentShoppingItems] = useState<any[]>([]);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

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
    if (currentUser) {
      loadConversations();
    }
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
      console.error("Failed to load conversations", error);
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
    setError("");
    setShowSidebar(false);
    setCurrentInventoryItems([]);
    setCurrentShoppingItems([]);
  };

  const resumeConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      setCurrentInventoryItems([]);
      setCurrentShoppingItems([]);

      const response = await fetch("/api/saved-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "get_by_conversation",
          conversation_id: conversation.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          if (item.type === "shopping" && item.content.items) {
            setCurrentShoppingItems(item.content.items);
          } else if (item.type === "moving" && item.content.items) {
            setCurrentInventoryItems(item.content.items);
          }
        }
      }
    } catch (error) {
      console.error("Error loading conversation data", error);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim() || isProcessing) return;
    
    // Auto-create conversation if none exists
    if (!activeConversation) {
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
    }
    
    const message = textInput.trim();
    setTextInput("");
    await handleConversationMessage(message);
  };

  const handleConversationMessage = async (message: string) => {
    if (!activeConversation) {
      setError("Please start a conversation first");
      return;
    }

    setIsProcessing(true);

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
      
      const requestBody = {
        message,
        conversationId: activeConversation.id.startsWith("temp-") ? null : activeConversation.id,
        conversationMessages: activeConversation.messages,
        mode: "conversation",
      };

      const response = await fetch("/api/smart-conversation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process message");
      }

      const data = await response.json();

      // Extract items from function results if present
      if (data.functionResults) {
        if (data.conversationType === "moving" && data.functionResults.items) {
          setCurrentInventoryItems(data.functionResults.items);
        } else if (data.conversationType === "shopping" && data.functionResults.items) {
          setCurrentShoppingItems(data.functionResults.items);
        }
      }

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
    } catch (error: any) {
      console.error("Error processing message:", error);
      setError("Sorry, I had trouble processing that. Please try again.");
    } finally {
      setIsProcessing(false);
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
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const handleTitleEdit = async (conversationId: string, newTitle: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch("/api/conversations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: conversationId,
          title: newTitle,
        }),
      });

      if (response.ok) {
        setConversations(prev => prev.map(c => 
          c.id === conversationId ? { ...c, title: newTitle } : c
        ));
        if (activeConversation?.id === conversationId) {
          setActiveConversation(prev => prev ? { ...prev, title: newTitle } : null);
        }
      }
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConversationId(conv.id);
    setEditTitle(conv.title);
  };

  const saveTitle = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await handleTitleEdit(convId, editTitle);
    }
    setEditingConversationId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConversationId(null);
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
              Chat Assistant
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
          {/* Sidebar */}
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
                New Chat
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
                          
                          {editingConversationId === conv.id ? (
                            <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex-1 h-6 text-sm px-1 border rounded"
                                autoFocus
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveTitle(conv.id, e as any);
                                  if (e.key === 'Escape') cancelEditing(e as any);
                                }}
                              />
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" onClick={(e) => saveTitle(conv.id, e)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={cancelEditing}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <h3 className="text-sm font-semibold line-clamp-1">{conv.title}</h3>
                          )}
                        </div>
                        
                        {!editingConversationId && (
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => startEditing(conv, e)}
                              className="flex-shrink-0 h-8 w-8 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conv.id);
                              }}
                              className="flex-shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {activeConversation ? (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="max-w-4xl mx-auto space-y-4">
                    {activeConversation.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <Card className={`p-4 max-w-[80%] ${
                          msg.role === "user" 
                            ? "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        }`}>
                          <div className="flex items-start gap-3">
                            {msg.role === "assistant" && (
                              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                {msg.role === "user" ? "You" : "Assistant"}
                              </p>
                              <p className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                    
                    {/* Display inventory or shopping list */}
                    {activeConversation.type === "moving" && currentInventoryItems.length > 0 && (
                      <div className="w-full">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                          Your Loft Inventory
                        </h3>
                        <InventoryTable items={currentInventoryItems} />
                      </div>
                    )}

                    {activeConversation.type === "shopping" && currentShoppingItems.length > 0 && (
                      <div className="w-full">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                          Your Shopping List
                        </h3>
                        <ShoppingListTable items={currentShoppingItems} />
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="flex justify-start">
                        <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                            <p className="text-gray-600 dark:text-gray-400">Thinking...</p>
                          </div>
                        </Card>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4">
                  <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleTextSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base disabled:opacity-50"
                      />
                      <Button
                        type="submit"
                        size="lg"
                        disabled={!textInput.trim() || isProcessing}
                        className="px-6"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                    
                    {error && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to Chat Assistant
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start a new conversation or select an existing one from the sidebar
                  </p>
                  <Button size="lg" onClick={startNewConversation}>
                    <Plus className="mr-2 h-5 w-5" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}