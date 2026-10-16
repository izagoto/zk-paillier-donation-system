type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
};

export function SegmentTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = 'Filter',
}: Props<T>) {
  return (
    <div className="tg-segment" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`tg-segment__btn ${
            value === opt.value ? 'tg-segment__btn--active' : ''
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
