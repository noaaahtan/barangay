import { PageHeader } from '@/components/ui';
import { ReportForm } from '@/features/e-sumbong/ReportForm';

export function ESumbongPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit E-Sumbong Report"
        description="Report incidents, concerns, or complaints to the barangay"
      />

      <div className="max-w-3xl">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <ReportForm />
        </div>
      </div>
    </div>
  );
}
