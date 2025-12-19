import { useState } from 'react';
import Topbar from '../../components/layout/Topbar';
import AnimatedButton from '../../components/common/AnimatedButton';
import EditablePreviewTable from '../../components/tables/EditablePreviewTable';
import ErrorSummaryPanel from '../../components/tables/ErrorSummaryPanel';
import { useToast } from '../../components/common/ToastProvider';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import FileDropzone from '../../components/common/FileDropzone';
import { apiUrl } from '../../config/api';

// 1. Define RowError interface
interface RowError {
  rowNumber: number;
  errors: string[];
}

// 2. Define LoadingPhase type
type LoadingPhase = 'idle' | 'upload' | 'validate' | 'submit';

// 3. Normalize data and errors
function normalizeData(input: any): Record<string, any>[] {
  if (Array.isArray(input)) return input;
  return [];
}

function normalizeErrors(input: any): RowError[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((e: any) => {
      if (typeof e?.rowNumber === 'number' && Array.isArray(e?.errors)) {
        return { rowNumber: e.rowNumber, errors: e.errors };
      }
      if (typeof e?.rowIndex === 'number' && Array.isArray(e?.messages)) {
        return { rowNumber: e.rowIndex, errors: e.messages };
      }
      return null;
    })
    .filter(Boolean) as RowError[];
}

export default function WeatherUploadPage() {
  const { pushToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<LoadingPhase>('idle');
  const [success, setSuccess] = useState<{ inserted: number; skipped: number; message: string } | null>(
    null,
  );

  // 4. Define overlayTitle and overlaySubtitle for loading
  const overlayTitle =
    phase === 'upload'
      ? 'Uploading & parsing Excel…'
      : phase === 'validate'
      ? 'Validating rows…'
      : phase === 'submit'
      ? 'Submitting to database…'
      : 'Processing…';

  const overlaySubtitle =
    phase === 'upload'
      ? 'Reading the file and converting it into rows.'
      : phase === 'validate'
      ? 'Checking schema rules and highlighting issues.'
      : phase === 'submit'
      ? 'Saving valid rows and skipping duplicates.'
      : 'Please wait.';

  // 5. Define downloadTemplate function
  const downloadTemplate = () => {
    window.open(apiUrl('/weather/template'), '_blank');
  };

  const handleUpload = async () => {
    if (!file) {
      pushToast({
        type: 'error',
        title: 'No file selected',
        message: 'Please choose an Excel file (.xlsx/.xls) and try again.',
      });
      return;
    }

    setLoading(true);
    setPhase('upload');
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/weather/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Upload failed');
      }

      const result: any = await res.json();

      const normalizedData = normalizeData(result?.data ?? result?.rows);
      const normalizedErrors = normalizeErrors(result?.errors);

      setData(normalizedData);
      setErrors(normalizedErrors);

      const valid = typeof result?.isValid === 'boolean' ? result.isValid : normalizedErrors.length === 0;
      setIsValid(valid);

      pushToast({
        type: valid ? 'success' : 'info',
        title: valid ? 'Upload validated' : 'Upload needs fixes',
        message: valid
          ? 'All rows are valid. You can submit to the database.'
          : `${normalizedErrors.length} row(s) have validation issues. Edit and re-validate.`,
      });
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Upload failed',
        message: err?.message || 'Could not upload/validate the file. Please try again.',
      });
    } finally {
      setLoading(false);
      setPhase('idle');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay show={loading} title={overlayTitle} subtitle={overlaySubtitle} />
      <Topbar title="Weather Excel Upload" subtitle="Upload, edit, validate, and submit weather data" />
      <div className="surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mb-2">Upload Excel File</h3>
            <p className="mb-4">Upload a weather Excel file. Fix validation errors directly in the table before submitting to the database.</p>
          </div>
          <AnimatedButton variant="secondary" onClick={downloadTemplate}>Download Template</AnimatedButton>
        </div>
        <div className="mt-4">
          <FileDropzone
            value={file}
            onChange={setFile}
            accept=".xlsx,.xls"
            disabled={loading}
            title="Drop your Weather Excel file here"
            hint="or click to browse (XLSX / XLS)"
          />
        </div>
        <div className="mt-4">
          <AnimatedButton variant="primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Processing…' : 'Upload & Validate'}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}
