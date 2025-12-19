import clsx from 'clsx';

interface RowError {
  rowNumber: number;
  errors: string[];
}

interface EditablePreviewTableProps {
  data: Record<string, any>[];
  errors: RowError[];
  onCellChange: (
    rowIndex: number,
    columnKey: string,
    value: string
  ) => void;
}

export default function EditablePreviewTable({
  data,
  errors,
  onCellChange,
}: EditablePreviewTableProps) {
  if (!data.length) {
    return (
      <div className="text-sm text-text-muted">
        No data to preview.
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  const errorRowIndexes = new Set(
    errors.map((e) => e.rowNumber - 2), // Excel row → index
  );

  return (
    <div className="overflow-auto border border-border-light dark:border-border-dark rounded-lg">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-bg-light dark:bg-bg-dark sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-medium border-b border-border-light dark:border-border-dark"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => {
            const hasError = errorRowIndexes.has(rowIndex);

            return (
              <tr
                key={rowIndex}
                className={clsx(
                  'border-b border-border-light dark:border-border-dark',
                  hasError &&
                    'bg-red-50 dark:bg-red-950/20',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2"
                  >
                    <input
                      type="text"
                      value={row[col] ?? ''}
                      onChange={(e) =>
                        onCellChange(
                          rowIndex,
                          col,
                          e.target.value,
                        )
                      }
                      className={clsx(
                        'w-full bg-transparent border border-transparent rounded px-1 py-0.5',
                        'focus:outline-none focus:border-primary',
                        hasError &&
                          'focus:border-danger',
                      )}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}