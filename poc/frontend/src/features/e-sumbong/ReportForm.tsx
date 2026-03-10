import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { LocationPicker } from '@/components/Map/LocationPicker';
import { useESumbongApi } from './useESumbongApi';
import { useToast } from '@/hooks/useToast';
import type { ReportType, ReportSeverity, CreateReportPayload } from '@/api/types';

const typeOptions: { value: ReportType; label: string }[] = [
  { value: 'CRIME', label: 'Crime' },
  { value: 'NOISE_COMPLAINT', label: 'Noise Complaint' },
  { value: 'PUBLIC_SAFETY', label: 'Public Safety' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure Issue' },
  { value: 'HEALTH_HAZARD', label: 'Health Hazard' },
  { value: 'STRAY_ANIMALS', label: 'Stray Animals' },
  { value: 'ILLEGAL_ACTIVITY', label: 'Illegal Activity' },
  { value: 'ENVIRONMENTAL', label: 'Environmental Issue' },
  { value: 'OTHER', label: 'Other' },
];

const severityOptions: { value: ReportSeverity; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'EMERGENCY', label: 'Emergency' },
];

export function ReportForm() {
  const navigate = useNavigate();
  const { createReport, uploadPhotos } = useESumbongApi();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<Partial<CreateReportPayload>>({
    type: undefined,
    severity: 'MEDIUM',
    title: '',
    description: '',
    latitude: 14.5995,
    longitude: 120.9842,
    locationAddress: '',
    isAnonymous: false,
    photoUrls: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 3) {
      addToast('You can upload a maximum of 3 photos', 'error');
      return;
    }
    setSelectedFiles([...selectedFiles, ...files].slice(0, 3));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.title || !formData.description) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      addToast('Please select a location on the map', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadPhotos(selectedFiles);
        if (uploadedUrls) {
          photoUrls = uploadedUrls;
        }
      }

      const result = await createReport({
        ...formData,
        photoUrls,
      } as CreateReportPayload);

      if (result) {
        addToast(
          `Report submitted successfully! Reference: ${result.referenceNumber}`,
          'success',
        );
        navigate('/e-sumbong/my-reports');
      } else {
        addToast('Failed to submit report', 'error');
      }
    } catch {
      addToast('Failed to submit report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Report Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Report Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type || ''}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as ReportType })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        >
          <option value="">Select report type</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Severity Level <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.severity || 'MEDIUM'}
          onChange={(e) => setFormData({ ...formData, severity: e.target.value as ReportSeverity })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        >
          {severityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Report Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief summary of the incident"
          maxLength={200}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
        <p className="text-xs text-slate-500 mt-1">{(formData.title || '').length}/200 characters</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Provide detailed information about the incident..."
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>

      {/* Location Picker */}
      <LocationPicker
        latitude={formData.latitude}
        longitude={formData.longitude}
        onLocationSelect={handleLocationSelect}
      />

      {/* Location Address (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Location Address (Optional)
        </label>
        <input
          type="text"
          value={formData.locationAddress || ''}
          onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
          placeholder="e.g., Near Barangay Hall, Main Street"
          maxLength={300}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Photos (Optional, max 3)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={selectedFiles.length >= 3}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-2 space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                <span className="text-sm text-slate-600 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anonymous Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={formData.isAnonymous || false}
          onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
          className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded"
        />
        <label htmlFor="anonymous" className="text-sm text-slate-700">
          Submit anonymously (your identity will be hidden from public view)
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/e-sumbong/my-reports')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
