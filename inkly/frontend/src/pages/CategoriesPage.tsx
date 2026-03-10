import { useState } from 'react';
import { PageHeader, Button, Modal, ConfirmDialog } from '@/components/ui';
import { CategoryList } from '@/features/categories/CategoryList';
import { CategoryForm } from '@/features/categories/CategoryForm';
import { useCategoriesApi } from '@/features/categories/useCategoriesApi';
import { useToast } from '@/hooks/useToast';
import type { Category } from '@/api/types';
import { HiPlus } from 'react-icons/hi2';

export function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategoriesApi();
  const { addToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setFormOpen(true);
  };

  const handleSubmit = async (name: string) => {
    try {
      setSubmitting(true);
      if (editing) {
        await updateCategory(editing.id, { name });
        addToast('Category updated');
      } else {
        await createCategory({ name });
        addToast('Category created');
      }
      setFormOpen(false);
    } catch {
      addToast('Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setSubmitting(true);
      await deleteCategory(deleting.id);
      addToast('Category deleted');
      setDeleting(null);
    } catch {
      addToast('Failed to delete category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your inventory items"
        action={
          <Button onClick={handleCreate}>
            <HiPlus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={setDeleting}
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Category' : 'New Category'}
      >
        <CategoryForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleting?.name}"? Items in this category will become uncategorized.`}
        loading={submitting}
      />
    </div>
  );
}
