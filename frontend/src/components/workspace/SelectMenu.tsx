import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type SelectMenuOption<T extends string | number> = {
  value: T;
  label: string | number;
};

type Props<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: SelectMenuOption<T>[];
  className?: string;
  /** Angka / kode — pakai font mono di label */
  mono?: boolean;
  'aria-label'?: string;
};

export function SelectMenu<T extends string | number>({
  value,
  onChange,
  options,
  className = '',
  mono = false,
  'aria-label': ariaLabel,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const current = options.find((opt) => opt.value === value);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${open ? 'z-50' : ''} ${className}`}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 min-w-[3.25rem] items-center justify-between gap-2 rounded-lg border bg-white px-3 text-sm text-trust-navy shadow-sm transition-all hover:bg-[#fafafa] focus:outline-none ${
          mono ? 'font-mono' : 'font-sans'
        } ${
          open
            ? 'border-trust-primary text-trust-primary ring-2 ring-trust-primary/15'
            : 'border-[#e4e4e7]'
        }`}
      >
        <span>{current?.label ?? value}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#a1a1aa] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-lg shadow-black/5"
          role="listbox"
        >
          <div className="max-h-48 overflow-y-auto py-1">
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? 'bg-blue-50 font-semibold text-trust-primary'
                      : 'text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#18181b]'
                  }`}
                >
                  <span className={mono ? 'font-mono' : ''}>{opt.label}</span>
                  {selected ? (
                    <Check className="h-3 w-3 shrink-0 text-trust-primary" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
