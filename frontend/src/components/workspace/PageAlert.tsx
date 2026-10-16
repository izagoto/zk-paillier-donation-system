type Props = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function PageAlert({ message, onRetry, retryLabel = 'Coba lagi' }: Props) {
  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="tg-btn tg-btn--secondary shrink-0 border-red-200 bg-white text-red-800 hover:bg-red-50"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
