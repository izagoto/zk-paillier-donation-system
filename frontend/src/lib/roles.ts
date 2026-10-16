export type UserRole = 'donor' | 'organizer' | 'auditor' | 'admin';

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    donor: 'Donatur',
    organizer: 'Pengelola campaign',
    auditor: 'Auditor',
    admin: 'Administrator',
  };
  return labels[role] ?? role;
}

export function canCreateCampaign(role: string): boolean {
  return role === 'organizer' || role === 'admin';
}

export function canDonate(role: string): boolean {
  return role === 'donor' || role === 'admin';
}

export function canAudit(role: string): boolean {
  return role === 'auditor' || role === 'admin';
}

export function canManageAdmin(role: string): boolean {
  return role === 'admin';
}
