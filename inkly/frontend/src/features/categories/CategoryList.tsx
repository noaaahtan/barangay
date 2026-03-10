import { Table, type Column, Button } from '@/components/ui';
import type { Category } from '@/api/types';
import { formatDate } from '@/lib/utils';
import { HiPencilSquare, HiTrash } from 'react-icons/hi2';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (cat) => <span className="font-medium">{cat.name}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (cat) => formatDate(cat.createdAt),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (cat) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(cat)}>
            <HiPencilSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(cat)}>
            <HiTrash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={categories}
      keyExtractor={(cat) => cat.id}
      emptyMessage="No categories yet. Create one to get started."
    />
  );
}
