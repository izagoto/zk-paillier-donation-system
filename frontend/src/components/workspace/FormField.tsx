import type { ReactNode } from 'react';

const inputClass =
  'h-11 w-full rounded-lg border border-trust-border bg-trust-surface px-3 text-sm text-trust-navy outline-none ring-trust-primary/20 placeholder:text-slate-400 focus:border-trust-primary focus:ring-2';

export function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-trust-navy">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-trust-muted">{hint}</span>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input className={inputClass} {...props} />;
}

export function TextArea({
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputClass} min-h-[5.5rem] resize-y py-2.5 ${className}`.trim()}
      {...props}
    />
  );
}
