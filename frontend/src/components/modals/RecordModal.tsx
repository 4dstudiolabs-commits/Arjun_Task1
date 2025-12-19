import { useState, useEffect } from 'react';
import AnimatedButton from '../common/AnimatedButton';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'number';
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface RecordModalProps {
  show: boolean;
  title: string;
  fields: Field[];
  initialData?: Record<string, any>;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
}

export default function RecordModal({
  show,
  title,
  fields,
  initialData,
  onClose,
  onSubmit,
}: RecordModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        const defaultData: Record<string, any> = {};
        fields.forEach((f) => {
          defaultData[f.key] = f.type === 'number' ? '' : '';
        });
        setFormData(defaultData);
      }
      setErrors({});
    }
  }, [show, initialData, fields]);

  const handleChange = (key: string, value: string, type: 'text' | 'number') => {
    setFormData((prev) => ({
      ...prev,
      [key]: type === 'number' && value !== '' ? parseFloat(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.key];

      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.key] = `${field.label} is required`;
        return;
      }

      if (field.type === 'number' && value !== '' && value !== undefined) {
        const num = Number(value);
        if (isNaN(num)) {
          newErrors[field.key] = `${field.label} must be a number`;
        } else {
          if (field.min !== undefined && num < field.min) {
            newErrors[field.key] = `${field.label} must be at least ${field.min}`;
          }
          if (field.max !== undefined && num > field.max) {
            newErrors[field.key] = `${field.label} must be at most ${field.max}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && <span className="text-danger ml-1">*</span>}
              </label>
              <input
                type={field.type}
                value={formData[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
                className={`w-full px-3 py-2 rounded-lg border transition-colors
                  ${errors[field.key]
                    ? 'border-danger focus:border-danger focus:ring-danger/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20'
                  }
                  bg-white dark:bg-slate-900 
                  focus:outline-none focus:ring-2`}
              />
              {errors[field.key] && (
                <p className="text-sm text-danger mt-1">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <AnimatedButton variant="secondary" onClick={onClose}>
            Cancel
          </AnimatedButton>
          <AnimatedButton variant="primary" onClick={handleSubmit}>
            {initialData ? 'Update' : 'Create'}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}