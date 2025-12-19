import AnimatedButton from '../common/AnimatedButton';

interface DeleteConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  show,
  title,
  message,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
            <WarningIcon />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <AnimatedButton variant="secondary" onClick={onClose}>
            Cancel
          </AnimatedButton>
          <AnimatedButton variant="danger" onClick={onConfirm}>
            Delete
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-danger" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}