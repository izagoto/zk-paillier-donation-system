export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  if (!local) {
    return email;
  }
  return local.charAt(0).toUpperCase() + local.slice(1);
}
