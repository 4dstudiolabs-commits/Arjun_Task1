interface RowError {
  rowNumber: number;
  errors: string[];
}

interface ErrorSummaryPanelProps {
  errors: RowError[];
}

export default function ErrorSummaryPanel({
  errors,
}: ErrorSummaryPanelProps) {
  if (!errors.length) {
    return (
      <div className="text-sm text-success">
        No validation errors found.
      </div>
    );
  }

  return (
    <div className="border border-border-light dark:border-border-dark rounded-lg p-4">
      <h4 className="text-sm font-semibold mb-3 text-danger">
        Validation Errors
      </h4>

      <ul className="space-y-3 max-h-60 overflow-auto">
        {errors.map((err) => (
          <li key={err.rowNumber}>
            <div className="text-sm font-medium">
              Row {err.rowNumber}
            </div>
            <ul className="ml-4 mt-1 list-disc text-sm text-text-muted">
              {err.errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

