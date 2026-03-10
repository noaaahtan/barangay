import { useState, useEffect } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { getImageUrl } from './useItemsApi';
import type { Item, Category } from '@/api/types';
import { HiOutlinePhoto, HiInformationCircle, HiXMark } from 'react-icons/hi2';

interface ItemFormProps {
  initialData?: Item | null;
  categories: Category[];
  onSubmit: (data: ItemFormData, imageFile?: File) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface ItemFormData {
  name: string;
  sku: string;
  description?: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  width?: number;
  height?: number;
  sizeUnit: string;
  categoryId?: string;
}

const SIZE_UNIT_OPTIONS = [
  { value: 'in', label: 'Inches (in)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'mm', label: 'Millimeters (mm)' },
];

export function ItemForm({ initialData, categories, onSubmit, onCancel, loading }: ItemFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showUploadNotice, setShowUploadNotice] = useState(false);

  const [form, setForm] = useState<ItemFormData>({
    name: '',
    sku: '',
    description: '',
    quantity: 0,
    price: 0,
    lowStockThreshold: 10,
    width: undefined,
    height: undefined,
    sizeUnit: 'in',
    categoryId: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        sku: initialData.sku,
        description: initialData.description || '',
        quantity: initialData.quantity,
        price: Number(initialData.price),
        lowStockThreshold: initialData.lowStockThreshold,
        width: initialData.width != null ? Number(initialData.width) : undefined,
        height: initialData.height != null ? Number(initialData.height) : undefined,
        sizeUnit: initialData.sizeUnit || 'in',
        categoryId: initialData.categoryId || '',
      });
      setImagePreview(getImageUrl(initialData.imageUrl));
    } else {
      setForm({
        name: '', sku: '', description: '', quantity: 0, price: 0,
        lowStockThreshold: 10, width: undefined, height: undefined, sizeUnit: 'in', categoryId: '',
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [initialData]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ItemFormData, string>> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (form.quantity == null || form.quantity < 0) errs.quantity = 'Must be 0 or more';
    if (form.price == null || form.price < 0) errs.price = 'Must be 0 or more';
    if (form.lowStockThreshold == null || form.lowStockThreshold < 0) errs.lowStockThreshold = 'Must be 0 or more';
    if (form.width != null && form.width < 0) errs.width = 'Must be 0 or more';
    if (form.height != null && form.height < 0) errs.height = 'Must be 0 or more';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (!payload.categoryId) delete payload.categoryId;
    if (!payload.description) delete payload.description;
    if (payload.width === undefined || payload.width === 0) delete payload.width;
    if (payload.height === undefined || payload.height === 0) delete payload.height;
    await onSubmit(payload);
  };

  const update = (field: keyof ItemFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleUploadClick = () => {
    setShowUploadNotice(true);
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload — disabled (no storage bucket) */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={handleUploadClick}
          className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-brand-400 hover:bg-brand-50/40"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400 group-hover:text-brand-400">
              <HiOutlinePhoto className="h-8 w-8" />
              <span className="mt-1 text-[10px] font-medium">Add Photo</span>
            </div>
          )}
        </button>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              error={errors.name}
              placeholder="e.g. Holographic Cat Sticker"
              autoFocus
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
              error={errors.sku}
              placeholder="e.g. STK-001"
            />
          </div>
        </div>
      </div>

      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Optional description"
      />

      {/* Size Fields */}
      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-2 text-sm font-medium text-slate-700">Sticker Size</legend>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Width"
            type="number"
            value={form.width ?? ''}
            onChange={(e) => update('width', e.target.value ? parseFloat(e.target.value) : undefined)}
            error={errors.width}
            placeholder="e.g. 3"
            step="0.01"
          />
          <Input
            label="Height"
            type="number"
            value={form.height ?? ''}
            onChange={(e) => update('height', e.target.value ? parseFloat(e.target.value) : undefined)}
            error={errors.height}
            placeholder="e.g. 3"
            step="0.01"
          />
          <Select
            label="Unit"
            value={form.sizeUnit}
            onChange={(e) => update('sizeUnit', e.target.value)}
            options={SIZE_UNIT_OPTIONS}
          />
        </div>
      </fieldset>

      {/* Price / Qty / Low Stock */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Quantity"
          type="number"
          value={form.quantity}
          onChange={(e) => update('quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
          error={errors.quantity}
        />
        <Input
          label="Price (₱)"
          type="number"
          value={form.price}
          onChange={(e) => update('price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
          error={errors.price}
          step="0.01"
        />
        <Input
          label="Low Stock Alert"
          type="number"
          value={form.lowStockThreshold}
          onChange={(e) => update('lowStockThreshold', e.target.value === '' ? 0 : parseInt(e.target.value))}
          error={errors.lowStockThreshold}
        />
      </div>

      <Select
        label="Category"
        value={form.categoryId}
        onChange={(e) => update('categoryId', e.target.value)}
        options={categoryOptions}
        placeholder="No category"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </div>

      {/* Centered upload-not-available notice */}
      {showUploadNotice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowUploadNotice(false)} />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-xl border border-blue-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowUploadNotice(false)}
              className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <HiXMark className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <HiInformationCircle className="h-7 w-7 text-blue-500" />
              </div>
              <p className="mt-3 text-sm text-slate-700">
                Wala pa to hahaha hindi free yung pag store-an ng images huhuhu
              </p>
              <Button
                type="button"
                onClick={() => setShowUploadNotice(false)}
                className="mt-4 w-full"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
