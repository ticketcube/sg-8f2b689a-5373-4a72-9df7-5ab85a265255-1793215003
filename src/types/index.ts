
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
