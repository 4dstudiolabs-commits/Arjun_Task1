import { useState } from 'react';
import Topbar from '../../components/layout/Topbar';
import AnimatedButton from '../../components/common/AnimatedButton';
import EditablePreviewTable from '../../components/tables/EditablePreviewTable';
import ErrorSummaryPanel from '../../components/tables/ErrorSummaryPanel';
import { useToast } from '../../components/common/ToastProvider';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import FileDropzone from '../../components/common/FileDropzone';
import { apiUrl } from '../../config/api';

interface RowError {
  rowNumber: number;
  errors: string[];
}

interface UploadResponse {
  data: Record<string, any>[];
  errors: RowError[];
  isValid: boolean;
}

interface ValidateResponse {
  errors: RowError[];
  isValid: boolean;
}

interface SubmitResponse {
  inserted: number;
  skipped: number;
  message: string;
}

type LoadingPhase = 'idle' | 'upload' | 'validate' | 'submit';

export default function MeterUploadPage() {
  const { pushToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<LoadingPhase>('idle');
  const [success, setSuccess] = useState<SubmitResponse | null>(null);

  const downloadTemplate = () => {
    window.open(apiUrl('/meter/template'), '_blank');
  };

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
      const res = await fetch(apiUrl('/meter/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error();

      const result: UploadResponse = await res.json();

      setData(result.data);
      setErrors(result.errors);
      setIsValid(result.isValid);

      pushToast({
        type: result.isValid ? 'success' : 'info',
        title: result.isValid ? 'Upload validated' : 'Upload needs fixes',
        message: result.isValid
          ? 'All rows are valid. You can submit to the database.'
          : `${result.errors.length} row(s) have validation issues. Edit and re-validate.`,
      });
    } catch {
      pushToast({
        type: 'error',
        title: 'Upload failed',
        message: 'Could not upload/validate the file. Please try again.',
      });
    } finally {
      setLoading(false);
      setPhase('idle');
    }
  };

  const handleCellChange = (rowIndex: number, columnKey: string, value: string) => {
    setData((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [columnKey]: value };
      return updated;
    });

    setIsValid(false);
    setSuccess(null);
  };

  const handleRevalidate = async () => {
    if (!data.length) {
      pushToast({
        type: 'info',
        title: 'Nothing to validate',
        message: 'Upload a file first to validate data.',
      });
      return;
    }

    setLoading(true);
    setPhase('validate');
    setSuccess(null);

    try {
      const res = await fetch(apiUrl('/meter/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: data }),
      });

      if (!res.ok) throw new Error();

      const result: ValidateResponse = await res.json();

      setErrors(result.errors);
      setIsValid(result.isValid);

      pushToast({
        type: result.isValid ? 'success' : 'info',
        title: result.isValid ? 'Validation passed' : 'Validation failed',
        message: result.isValid
          ? 'All rows are valid. You can submit now.'
          : `${result.errors.length} row(s) still have issues.`,
      });
    } catch {
      pushToast({
        type: 'error',
        title: 'Re-validation failed',
        message: 'Could not validate the edited data. Please try again.',
      });
    } finally {
      setLoading(false);
      setPhase('idle');
    }
  };

  const handleSubmit = async () => {
    if (!data.length) {
      pushToast({
        type: 'info',
        title: 'Nothing to submit',
        message: 'Upload and validate a file first.',
      });
      return;
    }

    if (!isValid) {
      pushToast({
        type: 'error',
        title: 'Cannot submit',
        message: 'Please re-validate and fix errors before submitting.',
      });
      return;
    }

    setLoading(true);
    setPhase('submit');

    try {
      const res = await fetch(apiUrl('/meter/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: data }),
      });

      if (!res.ok) throw new Error();

      const result: SubmitResponse = await res.json();
      setSuccess(result);

      pushToast({
        type: 'success',
        title: 'Submitted successfully',
        message: `${result.inserted} inserted, ${result.skipped} skipped.`,
      });

      setData([]);
      setErrors([]);
      setIsValid(false);
      setFile(null);
    } catch {
      pushToast({
        type: 'error',
        title: 'Submission failed',
        message: 'Could not submit to database. Please try again.',
      });
    } finally {
      setLoading(false);
      setPhase('idle');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay show={loading} title={overlayTitle} subtitle={overlaySubtitle} />

      <Topbar title="Meter Excel Upload" subtitle="Upload, edit, validate, and submit meter data" />

      <div className="surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mb-2">Upload Excel File</h3>
            <p className="mb-4">
              Upload a meter Excel file. Fix validation errors directly in the table before submitting to the database.
            </p>
          </div>

          <AnimatedButton variant="secondary" onClick={downloadTemplate}>
            Download Template
          </AnimatedButton>
        </div>

        <div className="mt-4">
          <FileDropzone
            value={file}
            onChange={setFile}
            accept=".xlsx,.xls"
            disabled={loading}
            title="Drop your Meter Excel file here"
            hint="or click to browse (XLSX / XLS)"
          />
        </div>

        <div className="mt-4">
          <AnimatedButton variant="primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Processing…' : 'Upload & Validate'}
          </AnimatedButton>
        </div>
      </div>

      {data.length > 0 && (
        <div className="surface p-6">
          <h3 className="mb-4">Preview & Edit Data</h3>
          <EditablePreviewTable data={data} errors={errors} onCellChange={handleCellChange} />
        </div>
      )}

      {errors.length > 0 && (
        <div className="surface p-6">
          <ErrorSummaryPanel errors={errors} />
        </div>
      )}

      {data.length > 0 && (
        <div className="flex items-center gap-4">
          <AnimatedButton variant="secondary" onClick={handleRevalidate} disabled={loading}>
            Re-Validate
          </AnimatedButton>

          <AnimatedButton variant="primary" onClick={handleSubmit} disabled={!isValid || loading}>
            Submit to Database
          </AnimatedButton>
        </div>
      )}

      {success && (
        <div className="surface p-6">
          <h3 className="mb-2 text-success">Submission Successful</h3>
          <p className="text-sm">
            {success.inserted} records inserted, {success.skipped} skipped.
          </p>
        </div>
      )}
    </div>
  );
}
