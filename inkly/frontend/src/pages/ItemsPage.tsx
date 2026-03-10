import { useState, useEffect } from 'react';
import { PageHeader, Button, Modal, ConfirmDialog, SearchInput, Select } from '@/components/ui';
import { ItemsTable } from '@/features/items/ItemsTable';
import { ItemForm, type ItemFormData } from '@/features/items/ItemForm';
import { StockAdjustForm } from '@/features/items/StockAdjustForm';
import { useItemsApi } from '@/features/items/useItemsApi';
import { useCategoriesApi } from '@/features/categories/useCategoriesApi';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import type { Item } from '@/api/types';
import { HiPlus } from 'react-icons/hi2';

export function ItemsPage() {
  const { items, loading, query, setQuery, createItem, updateItem, deleteItem, adjustStock } = useItemsApi();
  const { categories } = useCategoriesApi();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [adjusting, setAdjusting] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Update query when search or category filter changes
  useEffect(() => {
    setQuery((prev) => ({ ...prev, search: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch, setQuery]);

  const handleCreate = () => { setEditing(null); setFormOpen(true); };

  const handleFormSubmit = async (data: ItemFormData) => {
    try {
      setSubmitting(true);
      if (editing) {
        await updateItem(editing.id, data);
        addToast('Item updated');
      } else {
        await createItem(data);
        addToast('Item created');
      }
      setFormOpen(false);
    } catch {
      addToast('Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setSubmitting(true);
      await deleteItem(deleting.id);
      addToast('Item deleted');
      setDeleting(null);
    } catch {
      addToast('Failed to delete item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (quantityChange: number, reason: string) => {
    if (!adjusting) return;
    try {
      setSubmitting(true);
      await adjustStock(adjusting.id, { quantityChange, reason });
      addToast('Stock adjusted');
      setAdjusting(null);
    } catch {
      addToast('Failed to adjust stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stickers"
        description="Manage your sticker inventory"
        action={
          <Button onClick={handleCreate}>
            <HiPlus className="h-4 w-4" />
            Add Sticker
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="w-72"
        />
        <Select
          options={categoryOptions}
          placeholder="All Categories"
          value={query.categoryId || ''}
          onChange={(e) => setQuery((prev) => ({ ...prev, categoryId: e.target.value || undefined, page: 1 }))}
          className="w-48"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <ItemsTable
          items={items}
          onEdit={(item) => { setEditing(item); setFormOpen(true); }}
          onDelete={setDeleting}
          onAdjustStock={setAdjusting}
        />
      )}

      {/* Item Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Sticker' : 'New Sticker'}
        className="max-w-2xl"
      >
        <ItemForm
          initialData={editing}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          loading={submitting}
        />
      </Modal>

      {/* Stock Adjust Modal */}
      <Modal
        open={!!adjusting}
        onClose={() => setAdjusting(null)}
        title={`Adjust Stock — ${adjusting?.name}`}
      >
        {adjusting && (
          <StockAdjustForm
            item={adjusting}
            onSubmit={handleAdjustStock}
            onCancel={() => setAdjusting(null)}
            loading={submitting}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Sticker"
        message={`Are you sure you want to delete "${deleting?.name}"? All stock history for this item will be lost.`}
        loading={submitting}
      />
    </div>
  );
}
