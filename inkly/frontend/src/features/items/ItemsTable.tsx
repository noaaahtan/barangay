import { Table, type Column, Button, Badge } from '@/components/ui';
import { LowStockBadge } from './LowStockBadge';
import { getImageUrl } from './useItemsApi';
import type { Item } from '@/api/types';
import { formatCurrency } from '@/lib/utils';
import { HiPencilSquare, HiTrash, HiArrowsRightLeft, HiOutlinePhoto } from 'react-icons/hi2';

interface ItemsTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onAdjustStock: (item: Item) => void;
}

function formatSize(item: Item): string | null {
  if (item.width == null && item.height == null) return null;
  const w = item.width ?? '—';
  const h = item.height ?? '—';
  return `${w} × ${h} ${item.sizeUnit || 'in'}`;
}

export function ItemsTable({ items, onEdit, onDelete, onAdjustStock }: ItemsTableProps) {
  const columns: Column<Item>[] = [
    {
      key: 'image',
      header: '',
      className: 'w-16',
      render: (item) => {
        const src = getImageUrl(item.imageUrl);
        return src ? (
          <img
            src={src}
            alt={item.name}
            className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
            <HiOutlinePhoto className="h-5 w-5" />
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-500">{item.sku}</p>
        </div>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      render: (item) => {
        const size = formatSize(item);
        return size ? (
          <Badge variant="info">{size}</Badge>
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="text-slate-600">
          {item.category?.name || <span className="text-slate-400">—</span>}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      className: 'text-right',
      render: (item) => <span className="font-mono">{item.quantity}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      className: 'text-right',
      render: (item) => formatCurrency(Number(item.price)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <LowStockBadge item={item} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32 text-right',
      render: (item) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onAdjustStock(item)} title="Adjust stock">
            <HiArrowsRightLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            <HiPencilSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
            <HiTrash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={items}
      keyExtractor={(item) => item.id}
      emptyMessage="No items found. Add your first sticker!"
    />
  );
}
