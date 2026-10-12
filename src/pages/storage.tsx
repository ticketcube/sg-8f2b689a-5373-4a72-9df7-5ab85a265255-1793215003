import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Tag, FileText, LogOut, Home } from "lucide-react";

interface SavedItem {
  id: string;
  type: string;
  title: string;
  content: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export default function StoragePage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SavedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", content: "", tags: "" });

  useEffect(() => {
    checkAuth();
    loadItems();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        JSON.stringify(item.content).toLowerCase().includes(query) ||
        (item.metadata?.tags && item.metadata.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", session.user.id)
      .single();

    if (profile?.full_name) {
      setUserName(profile.full_name);
    }
  }

  async function loadItems() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading items:", error);
    } else {
      setItems(data || []);
      setFilteredItems(data || []);
    }
    setLoading(false);
  }

  async function handleAddItem() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newItem.title.trim()) return;

    const tags = newItem.tags.split(",").map(t => t.trim()).filter(t => t);
    
    const { error } = await supabase
      .from("saved_items")
      .insert({
        user_id: session.user.id,
        type: "general",
        title: newItem.title,
        content: { text: newItem.content },
        metadata: { tags }
      });

    if (error) {
      console.error("Error adding item:", error);
    } else {
      setNewItem({ title: "", content: "", tags: "" });
      setIsAddingItem(false);
      loadItems();
    }
  }

  async function handleDeleteItem(id: string) {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting item:", error);
    } else {
      loadItems();
      setSelectedItem(null);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-serif text-xl font-semibold text-foreground">Personal Storage</h1>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userName}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your stored items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Add New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter item title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    placeholder="Enter content or notes"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <Input
                    value={newItem.tags}
                    onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                    placeholder="work, personal, important (comma-separated)"
                  />
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Save Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your items...</div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? "No items match your search" : "No items stored yet"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddingItem(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-serif text-lg mb-2">{item.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-serif">{item.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Content:</p>
                              <div className="bg-muted p-4 rounded-md">
                                <p className="whitespace-pre-wrap">{item.content?.text || JSON.stringify(item.content)}</p>
                              </div>
                            </div>
                            {item.metadata?.tags && item.metadata.tags.length > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                                <div className="flex flex-wrap gap-2">
                                  {item.metadata.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteItem(item.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Item
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.content?.text || JSON.stringify(item.content).slice(0, 150)}
                  </p>
                  {item.metadata?.tags && item.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.metadata.tags.slice(0, 5).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}