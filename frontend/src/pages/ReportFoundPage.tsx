import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportForm } from '../components/ReportForm';
import { api } from '../lib/api';
import { ItemFormData } from '../lib/types';
import { AlertTriangle } from 'lucide-react';

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const result = await api.createItem({
        ...data,
        report_type: 'found',
      });

      // Redirect directly to the item details page showing potential matches
      navigate(`/item/${result.item.id}`);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmitError(
        err.message || 'An error occurred while submitting your found item report.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <ReportForm
        initialReportType="found"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
