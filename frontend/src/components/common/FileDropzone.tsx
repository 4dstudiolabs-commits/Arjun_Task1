import React, { useMemo, useRef, useState } from 'react';

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  title?: string;
  hint?: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function FileDropzone({
  value,
  onChange,
  accept = '.xlsx,.xls',
  disabled = false,
  title = 'Drop your Excel file here',
  hint = 'or click to browse (XLSX / XLS)',
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileMeta = useMemo(() => {
    if (!value) return null;
    return {
      name: value.name,
      size: formatBytes(value.size),
      type: value.type || 'file',
    };
  }, [value]);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const pickFile = (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }
    onChange(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    pickFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setDragOver(false);

    const file = e.dataTransfer.files?.[0] ?? null;
    pickFile(file);
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    if (disabled) return;
    setDragOver(over);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openPicker();
        }}
        onDrop={onDrop}
        onDragOver={(e) => onDrag(e, true)}
        onDragLeave={(e) => onDrag(e, false)}
        className={[
          'group relative rounded-2xl border p-4 transition',
          'bg-white dark:bg-slate-950',
          'border-slate-200 dark:border-slate-800',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          dragOver
            ? 'border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40'
            : 'hover:bg-slate-50 dark:hover:bg-slate-900/30',
        ].join(' ')}
      >
        <div className="flex items-start gap-4">
          <div
            className={[
              'mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border',
              'border-slate-200 bg-slate-50 text-slate-700',
              'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
              dragOver ? 'ring-2 ring-slate-300 dark:ring-slate-700' : '',
            ].join(' ')}
            aria-hidden="true"
          >
            <UploadIcon />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hint}
            </div>

            {fileMeta && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{fileMeta.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {fileMeta.size}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                      if (inputRef.current) inputRef.current.value = '';
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/40"
                    disabled={disabled}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {!disabled && (
            <div className="hidden shrink-0 items-center gap-2 pt-1 text-xs text-slate-500 group-hover:flex dark:text-slate-400">
              <span>Click</span>
              <span className="opacity-50">or</span>
              <span>Drop</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
