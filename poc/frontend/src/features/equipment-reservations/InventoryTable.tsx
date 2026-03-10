import { Table, Button } from "@/components/ui";
import type { EquipmentItem } from "@/api/types";

interface InventoryTableProps {
  items: EquipmentItem[];
  onEdit: (item: EquipmentItem) => void;
  onDeactivate: (item: EquipmentItem) => void;
}

export function InventoryTable({ items, onEdit, onDeactivate }: InventoryTableProps) {
  return (
    <Table
      data={items}
      keyExtractor={(item) => item.id}
      emptyMessage="No equipment items found"
      columns={[
        {
          key: "name",
          header: "Item",
          render: (item) => (
            <div>
              <p className="font-medium text-slate-800">{item.name}</p>
              <p className="text-xs text-slate-500">{item.type.replace(/_/g, " ")}</p>
            </div>
          ),
        },
        {
          key: "quantity",
          header: "Total",
          render: (item) => item.quantityTotal,
        },
        {
          key: "status",
          header: "Status",
          render: (item) => (item.isActive ? "Active" : "Inactive"),
        },
        {
          key: "actions",
          header: "Actions",
          render: (item) => (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDeactivate(item)}
                disabled={!item.isActive}
              >
                Deactivate
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
