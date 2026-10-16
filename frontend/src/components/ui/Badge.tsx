type Tone = 'success' | 'warning' | 'neutral' | 'info';

const toneClass: Record<Tone, string> = {
  success: 'badge--success',
  warning: 'badge--warning',
  neutral: 'badge--neutral',
  info: 'badge--info',
};

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return <span className={`badge ${toneClass[tone]}`}>{children}</span>;
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'active':
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'warning';
    default:
      return 'neutral';
  }
}
