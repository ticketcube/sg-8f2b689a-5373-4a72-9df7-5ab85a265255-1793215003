import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryItem {
  name: string;
  floor: string;
  city: string;
  recipient: string;
  notes?: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  if (!items || items.length === 0) {
    return (
      <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No items in your inventory yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="font-semibold">Floor</TableHead>
            <TableHead className="font-semibold">Going To</TableHead>
            <TableHead className="font-semibold">City</TableHead>
            <TableHead className="font-semibold">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Floor {item.floor}
                </span>
              </TableCell>
              <TableCell>{item.recipient}</TableCell>
              <TableCell>{item.city}</TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                {item.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}