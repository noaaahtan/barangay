import { StatCard } from '@/components/ui';
import type { InventoryStats } from '@/api/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { HiOutlineCube, HiOutlineExclamationTriangle, HiOutlineCurrencyDollar, HiOutlineTag } from 'react-icons/hi2';

interface StatCardsProps {
  stats: InventoryStats;
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Items"
        value={formatNumber(stats.totalItems)}
        icon={<HiOutlineCube className="h-5 w-5" />}
        iconColor="sky"
      />
      <StatCard
        label="Low Stock"
        value={formatNumber(stats.lowStockCount)}
        icon={<HiOutlineExclamationTriangle className="h-5 w-5" />}
        iconColor="coral"
      />
      <StatCard
        label="Total Value"
        value={formatCurrency(stats.totalValue)}
        icon={<HiOutlineCurrencyDollar className="h-5 w-5" />}
        iconColor="gold"
      />
      <StatCard
        label="Categories"
        value={formatNumber(stats.totalCategories)}
        icon={<HiOutlineTag className="h-5 w-5" />}
        iconColor="sky"
      />
    </div>
  );
}
