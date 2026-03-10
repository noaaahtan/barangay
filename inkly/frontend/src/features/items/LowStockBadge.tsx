import { Badge } from '@/components/ui';
import type { Item } from '@/api/types';

interface LowStockBadgeProps {
  item: Item;
}

export function LowStockBadge({ item }: LowStockBadgeProps) {
  const isLow = item.quantity <= item.lowStockThreshold;
  return (
    <Badge variant={isLow ? 'danger' : 'success'}>
      {isLow ? 'Low Stock' : 'In Stock'}
    </Badge>
  );
}
