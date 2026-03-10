import { useState } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import type { Item } from '@/api/types';

interface StockAdjustFormProps {
  item: Item;
  onSubmit: (quantityChange: number, reason: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function StockAdjustForm({ item, onSubmit, onCancel, loading }: StockAdjustFormProps) {
  const [quantityChange, setQuantityChange] = useState(0);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ quantity?: string; reason?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (quantityChange === 0) errs.quantity = 'Change cannot be zero';
    if (item.quantity + quantityChange < 0) errs.quantity = 'Cannot go below zero';
    if (!reason.trim()) errs.reason = 'Reason is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit(quantityChange, reason.trim());
  };

  const newQuantity = item.quantity + quantityChange;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-brand-50/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Current Stock</span>
          <span className="font-semibold">{item.quantity}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">After Adjustment</span>
          <span className={`font-semibold ${newQuantity < 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {newQuantity}
          </span>
        </div>
      </div>

      <Input
        label="Quantity Change"
        type="number"
        value={quantityChange}
        onChange={(e) => { setQuantityChange(parseInt(e.target.value) || 0); setErrors({}); }}
        error={errors.quantity}
        placeholder="e.g. -5 or +10"
      />

      <Textarea
        label="Reason"
        value={reason}
        onChange={(e) => { setReason(e.target.value); setErrors({}); }}
        error={errors.reason}
        placeholder="e.g. Sold 5 units to customer"
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adjusting...' : 'Adjust Stock'}
        </Button>
      </div>
    </form>
  );
}
