import { canCreateCampaign, canDonate } from './roles';

export function getPostLoginPath(role: string): string {
  if (canCreateCampaign(role)) {
    return '/organizer';
  }
  if (canDonate(role)) {
    return '/donor';
  }
  return '/campaigns';
}
