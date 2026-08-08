interface LoadingScreenProps {
  title?: string;
  description?: string;
  fullViewport?: boolean;
  className?: string;
}

export default function LoadingScreen({
  title = "연결하는 중이에요",
  description,
  fullViewport = true,
  className = "",
}: LoadingScreenProps) {
  return (
    <div
      className={`flex ${
        fullViewport ? "min-h-screen" : "min-h-[60vh]"
      } flex-col items-center justify-center gap-4 bg-brand-pink-light/40 px-6 py-20 text-center ${className}`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-pink-light border-t-brand-pink" />
      <div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
}
