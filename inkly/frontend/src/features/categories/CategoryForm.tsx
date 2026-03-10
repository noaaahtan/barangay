import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import type { Category } from '@/api/types';

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CategoryForm({ initialData, onSubmit, onCancel, loading }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialData?.name || '');
    setError('');
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    await onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Category Name"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(''); }}
        error={error}
        placeholder="e.g. Electronics"
        autoFocus
      />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
