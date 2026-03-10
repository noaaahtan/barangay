import { useState } from 'react';
import { Modal, Input, Textarea, Select, Button } from '@/components/ui';
import { useApplicationsApi } from './useApplicationsApi';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import type { ApplicationType, CreateApplicationPayload } from '@/api/types';

const typeOptions = [
  { value: 'BARANGAY_CLEARANCE', label: 'Barangay Clearance' },
  { value: 'CERTIFICATE_OF_RESIDENCY', label: 'Certificate of Residency' },
  { value: 'BUSINESS_PERMIT', label: 'Business Permit' },
  { value: 'INDIGENCY_CERTIFICATE', label: 'Indigency Certificate' },
  { value: 'CEDULA', label: 'Cedula' },
];

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationForm({
  isOpen,
  onClose,
  onSuccess,
}: ApplicationFormProps) {
  const { user } = useAuth();
  const { createApplication } = useApplicationsApi();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<CreateApplicationPayload>({
    type: '' as ApplicationType,
    applicantName: user?.name || '',
    applicantEmail: user?.email || '',
    applicantPhone: '+639',
    applicantAddress: '',
    purpose: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const withoutPrefix = digits.startsWith('63') ? digits.slice(2) : digits;
    const local = withoutPrefix.slice(0, 10);
    return `+63${local}`;
  };

  const getLocalPhoneDigits = (value: string) => value.replace(/\D/g, '').slice(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.purpose) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (getLocalPhoneDigits(formData.applicantPhone).length !== 10) {
      addToast('Phone number must be 10 digits after +63', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await createApplication(formData);
    setIsSubmitting(false);

    if (result) {
      addToast(
        `Application submitted successfully! Reference: ${result.referenceNumber}`,
        'success',
      );
      onSuccess();
      onClose();
    } else {
      addToast('Failed to submit application', 'error');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Apply for Document">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Document Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={typeOptions}
            placeholder="Select document type"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as ApplicationType,
              })
            }
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.applicantName}
            onChange={(e) =>
              setFormData({ ...formData, applicantName: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.applicantEmail}
            onChange={(e) =>
              setFormData({ ...formData, applicantEmail: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.applicantPhone}
            onChange={(e) =>
              setFormData({
                ...formData,
                applicantPhone: normalizePhone(e.target.value),
              })
            }
            placeholder="+63 912 345 6789"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Complete Address <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={formData.applicantAddress}
            onChange={(e) =>
              setFormData({ ...formData, applicantAddress: e.target.value })
            }
            placeholder="Purok, Barangay, City"
            rows={2}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Purpose <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
            placeholder="State the reason for this application (min. 10 characters)"
            rows={3}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
