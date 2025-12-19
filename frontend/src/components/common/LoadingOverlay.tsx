import React from 'react';

type Props = {
  show: boolean;
  title?: string;
  subtitle?: string;
};

export default function LoadingOverlay({ show, title, subtitle }: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

      {/* Card */}
      <div className="relative w-[420px] max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
            <Spinner />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {title ?? 'Processing…'}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle ?? 'Please wait. Do not refresh the page.'}
            </div>
          </div>
        </div>

        {/* Subtle progress shimmer */}
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
          <div className="h-full w-1/2 animate-[shimmer_1.2s_infinite] rounded-full bg-slate-300/70 dark:bg-slate-700/60" />
        </div>

        <style>
          {`
            @keyframes shimmer {
              0% { transform: translateX(-60%); }
              100% { transform: translateX(220%); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 animate-spin" fill="none" aria-hidden="true">
      <path
        d="M12 3a9 9 0 1 0 9 9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
