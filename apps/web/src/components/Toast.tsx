import { useToastStore } from '../stores/toast';

export function Toast() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => dismiss(toast.id)}
          className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow-lg cursor-pointer hover:bg-gray-800 transition-colors"
        >
          {toast.type === 'success' ? (
            <svg
              className="w-5 h-5 text-green-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <p className="text-sm text-gray-200">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
