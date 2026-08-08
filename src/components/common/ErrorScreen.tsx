import type { ReactNode } from "react";

interface ErrorScreenProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullViewport?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function ErrorScreen({
  title = "문제가 발생했어요",
  message,
  onRetry,
  retryLabel = "다시 시도",
  fullViewport = true,
  className = "",
  children,
}: ErrorScreenProps) {
  return (
    <div
      className={`flex ${
        fullViewport ? "min-h-screen" : "min-h-[60vh]"
      } items-center justify-center bg-brand-pink-light/40 px-6 py-20 ${className}`}
    >
      <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
          !
        </div>

        <h1 className="mt-4 text-xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-red-600">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 w-full rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark"
          >
            {retryLabel}
          </button>
        )}

        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
