import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShoppingItem {
  name: string;
  quantity?: string;
  notes?: string;
}

interface ShoppingListTableProps {
  items: ShoppingItem[];
}

export function ShoppingListTable({ items }: ShoppingListTableProps) {
  if (!items || items.length === 0) {
    return (
      <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No items in your shopping list yet.
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
            <TableHead className="font-semibold">Quantity</TableHead>
            <TableHead className="font-semibold">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.quantity || "-"}</TableCell>
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