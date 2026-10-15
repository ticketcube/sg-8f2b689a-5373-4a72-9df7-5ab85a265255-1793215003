import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Save, Trash2, ZoomIn, ZoomOut, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

interface MindMap {
  id?: string;
  title: string;
  nodes: Node[];
  connections: Connection[];
}

function MindMapCanvas() {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", x: 50, y: 50, text: "Central Idea", color: "#3b82f6" }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mindMapTitle, setMindMapTitle] = useState("My Mind Map");
  const [savedMaps, setSavedMaps] = useState<MindMap[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    loadSavedMaps();
  }, []);

  const loadSavedMaps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mind_maps")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setSavedMaps(data.map(map => {
          const mapData = map.data as any;
          return {
            id: map.id,
            title: map.title,
            nodes: Array.isArray(mapData?.nodes) ? mapData.nodes : [],
            connections: Array.isArray(mapData?.connections) ? mapData.connections : []
          };
        }));
      }
    } catch (error) {
      console.error("Error loading maps:", error);
    }
  };

  const saveMindMap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to save mind maps",
          variant: "destructive"
        });
        return;
      }

      const mapData = {
        user_id: user.id,
        title: mindMapTitle,
        data: { nodes, connections } as any // Cast to any for Json type compatibility
      };

      if (currentMapId) {
        const { error } = await supabase
          .from("mind_maps")
          .update(mapData)
          .eq("id", currentMapId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("mind_maps")
          .insert([mapData])
          .select()
          .single();

        if (error) throw error;
        if (data) setCurrentMapId(data.id);
      }

      toast({
        title: "Success",
        description: "Mind map saved successfully"
      });
      
      loadSavedMaps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save mind map",
        variant: "destructive"
      });
    }
  };

  const loadMindMap = (map: MindMap) => {
    setNodes(map.nodes);
    setConnections(map.connections);
    setMindMapTitle(map.title);
    setCurrentMapId(map.id || null);
    toast({
      title: "Loaded",
      description: `Loaded "${map.title}"`
    });
  };

  const addNode = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (editingNode || draggedNode || isPanning) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left - offset.x) / scale);
    const y = ((clientY - rect.top - offset.y) / scale);

    const newNode: Node = {
      id: Date.now().toString(),
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      text: "New Idea",
      color: colors[nodes.length % colors.length]
    };

    setNodes([...nodes, newNode]);

    if (selectedNode) {
      setConnections([...connections, { from: selectedNode, to: newNode.id }]);
    }
  };

  const handleNodeTouchStart = (e: React.TouchEvent, nodeId: string) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (draggedNode) {
      const dx = (clientX - dragStart.x) / scale;
      const dy = (clientY - dragStart.y) / scale;

      setNodes(nodes.map(node =>
        node.id === draggedNode
          ? { ...node, x: Math.max(0, Math.min(100, node.x + dx)), y: Math.max(0, Math.min(100, node.y + dy)) }
          : node
      ));
      setDragStart({ x: clientX, y: clientY });
    } else if (isPanning) {
      const dx = clientX - panStart.x;
      const dy = clientY - panStart.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setPanStart({ x: clientX, y: clientY });
    }
  };

  const handleTouchEnd = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditText(node.text);
    }
  };

  const saveNodeEdit = () => {
    if (editingNode) {
      setNodes(nodes.map(node =>
        node.id === editingNode ? { ...node, text: editText } : node
      ));
      setEditingNode(null);
      setEditText("");
    }
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const zoomIn = () => setScale(Math.min(scale * 1.2, 3));
  const zoomOut = () => setScale(Math.max(scale * 0.8, 0.3));
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <Input
          value={mindMapTitle}
          onChange={(e) => setMindMapTitle(e.target.value)}
          className="max-w-xs"
          placeholder="Mind Map Title"
        />
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={resetView}>
            <Home className="h-4 w-4" />
          </Button>
          <Button onClick={saveMindMap}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move touch-none"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleMove}
          onTouchEnd={handleTouchEnd}
          onClick={addNode}
        >
          <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {connections.map((conn, i) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={i}
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              );
            })}

            {nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="30"
                  fill={node.color}
                  stroke={selectedNode === node.id ? "#fbbf24" : "white"}
                  strokeWidth={selectedNode === node.id ? "3" : "2"}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
                  onDoubleClick={() => handleNodeDoubleClick(node.id)}
                  className="cursor-pointer"
                />
                <text
                  x={`${node.x}%`}
                  y={`${node.y}%`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="500"
                  pointerEvents="none"
                  className="select-none"
                >
                  {node.text.length > 12 ? node.text.substring(0, 12) + "..." : node.text}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {selectedNode && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteNode(selectedNode)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              size="sm"
              onClick={() => handleNodeDoubleClick(selectedNode)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-card">
        <p className="text-sm text-muted-foreground text-center mb-2">
          Tap to add nodes • Drag to move • Double-tap to edit
        </p>
        <Button className="w-full" variant="outline" onClick={addNode as any}>
          <Plus className="h-4 w-4 mr-2" />
          Add Node
        </Button>
      </div>

      {editingNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">Edit Node</h3>
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Node text"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && saveNodeEdit()}
            />
            <div className="flex gap-2">
              <Button onClick={saveNodeEdit} className="flex-1">
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingNode(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {savedMaps.length > 0 && (
        <div className="p-4 border-t bg-card max-h-48 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2">Saved Mind Maps</h3>
          <div className="space-y-2">
            {savedMaps.map(map => (
              <Button
                key={map.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => loadMindMap(map)}
              >
                {map.title}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MindMapPage() {
  return (
    <ProtectedRoute>
      <MindMapCanvas />
    </ProtectedRoute>
  );
}