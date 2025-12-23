export interface ConversationItem {
  question: string;
  answer: string;
  timestamp: Date;
}

export interface SearchResult {
  title: string;
  description: string;
  url: string;
}

export interface SavedItem {
  id: string;
  type: "shopping" | "moving" | "email";
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListContent {
  items: Array<{
    name: string;
    timing?: string;
  }>;
}

export interface MovingListContent {
  items: Array<{
    item: string;
    recipient?: string;
    storage?: string;
    notes?: string;
  }>;
}

export interface EmailDraftContent {
  recipient: string;
  subject: string;
  body: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  type: "shopping" | "moving" | "email" | "general";
  status: "active" | "saved";
  created_at: string;
  updated_at: string;
}