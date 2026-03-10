import { useEffect } from 'react';
import { PageHeader, Select } from '@/components/ui';
import { StockTimeline } from '@/features/stock-history/StockTimeline';
import { useStockHistoryApi } from '@/features/stock-history/useStockHistoryApi';

export function StockHistoryPage() {
  const { history, items, selectedItemId, loading, fetchItems, selectItem } = useStockHistoryApi();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const itemOptions = items.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.sku})`,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock History"
        description="Track quantity changes over time"
      />

      <div className="max-w-sm">
        <Select
          label="Select Item"
          options={itemOptions}
          placeholder="Choose an item..."
          value={selectedItemId}
          onChange={(e) => selectItem(e.target.value)}
        />
      </div>

      {selectedItemId && (
        loading ? (
          <p className="text-sm text-slate-500">Loading history...</p>
        ) : (
          <StockTimeline entries={history} />
        )
      )}
    </div>
  );
}
