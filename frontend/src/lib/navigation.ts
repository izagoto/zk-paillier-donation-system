import type { LucideIcon } from 'lucide-react';
import {
  FolderKanban,
  Heart,
  ShieldCheck,
  LayoutDashboard,
  Plus,
  Receipt,
  Search,
  User,
} from 'lucide-react';
import { getPostLoginPath } from './flow';
import { canAudit, canCreateCampaign, canDonate, canManageAdmin } from './roles';

/** Label navigasi & judul halaman — satu sumber agar konsisten di header, breadcrumb, dan menu. */
export const NAV = {
  home: 'Beranda',
  dashboard: 'Dashboard',
  exploreCampaigns: 'Jelajahi campaign',
  myCampaigns: 'Campaign saya',
  donationHistory: 'Riwayat donasi',
  incomingDonations: 'Donasi masuk',
  profile: 'Profil',
  createCampaign: 'Buat campaign',
  campaignDetail: 'Detail campaign',
} as const;

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export function workspaceHomePath(role: string): string {
  return getPostLoginPath(role);
}

export function profilePathForRole(role: string): string {
  if (canCreateCampaign(role)) {
    return '/organizer/profile';
  }
  if (canDonate(role)) {
    return '/donor/profile';
  }
  if (canAudit(role)) {
    return '/auditor/profile';
  }
  return '/donor/profile';
}

export function campaignListBackPath(role?: string): string {
  if (role && canCreateCampaign(role)) {
    return '/campaigns?mine=1';
  }
  return '/campaigns';
}

export function navIsActive(item: NavItem, pathname: string, search: string) {
  if (item.to.includes('?')) {
    const [path, query] = item.to.split('?');
    if (query.includes('mine=1')) {
      return (
        (pathname === path && search.includes(query)) ||
        pathname === '/campaigns/new'
      );
    }
    return pathname === path && search.includes(query);
  }
  if (item.to === '/campaigns' && item.end) {
    return pathname === '/campaigns' && !search.includes('mine=1');
  }
  if (item.to === '/campaigns/new') {
    return pathname === '/campaigns/new';
  }
  if (item.end) {
    return pathname === item.to;
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function workspaceNavGroupsForRole(role: string): NavGroup[] {
  if (canCreateCampaign(role)) {
    const summaryItems: NavItem[] = [
      {
        to: '/organizer',
        label: NAV.dashboard,
        icon: LayoutDashboard,
        end: true,
      },
    ];
    if (canManageAdmin(role)) {
      summaryItems.push({
        to: '/admin/reconciliation',
        label: 'Rekonsiliasi',
        icon: ShieldCheck,
      });
    }
    const groups: NavGroup[] = [
      {
        title: 'Ringkasan',
        items: summaryItems,
      },
      {
        title: 'Campaign',
        items: [
          {
            to: '/campaigns?mine=1',
            label: NAV.myCampaigns,
            icon: FolderKanban,
          },
          {
            to: '/organizer/donations',
            label: NAV.incomingDonations,
            icon: Receipt,
          },
        ],
      },
    ];

    if (canManageAdmin(role)) {
      groups.push({
        title: 'Donasi (admin)',
        items: [
          {
            to: '/campaigns',
            label: NAV.exploreCampaigns,
            icon: Search,
            end: true,
          },
          {
            to: '/donor/donations',
            label: NAV.donationHistory,
            icon: Heart,
          },
        ],
      });
    }

    groups.push({
      title: 'Akun',
      items: [{ to: '/organizer/profile', label: NAV.profile, icon: User }],
    });

    return groups;
  }

  if (canAudit(role) && !canCreateCampaign(role) && !canDonate(role)) {
    return [
      {
        title: 'Audit',
        items: [
          {
            to: '/auditor',
            label: 'Transparansi',
            icon: LayoutDashboard,
            end: true,
          },
          {
            to: '/campaigns',
            label: NAV.exploreCampaigns,
            icon: Search,
            end: true,
          },
        ],
      },
      {
        title: 'Akun',
        items: [{ to: '/auditor/profile', label: NAV.profile, icon: User }],
      },
    ];
  }

  if (canDonate(role)) {
    return [
      {
        title: 'Ringkasan',
        items: [
          { to: '/donor', label: NAV.dashboard, icon: LayoutDashboard, end: true },
        ],
      },
      {
        title: 'Donasi',
        items: [
          {
            to: '/campaigns',
            label: NAV.exploreCampaigns,
            icon: Search,
            end: true,
          },
          {
            to: '/donor/donations',
            label: NAV.donationHistory,
            icon: Heart,
          },
        ],
      },
      {
        title: 'Akun',
        items: [{ to: '/donor/profile', label: NAV.profile, icon: User }],
      },
    ];
  }

  return [
    {
      title: 'Menu',
      items: [
        { to: '/campaigns', label: 'Campaign', icon: FolderKanban },
        { to: profilePathForRole(role), label: NAV.profile, icon: User },
      ],
    },
  ];
}

export function workspaceNavForRole(role: string): NavItem[] {
  return workspaceNavGroupsForRole(role).flatMap((group) => group.items);
}

export type BreadcrumbItem = { label: string; to?: string };

export type BreadcrumbOptions = {
  /** Judul entitas di crumb terakhir (mis. nama campaign). */
  entityTitle?: string;
};

export function breadcrumbsForPath(
  pathname: string,
  search: string,
  role?: string,
  options?: BreadcrumbOptions,
): BreadcrumbItem[] {
  const homeTo = role ? workspaceHomePath(role) : '/';

  if (pathname === '/organizer' || pathname === '/donor' || pathname === '/auditor') {
    return [{ label: NAV.dashboard }];
  }

  const items: BreadcrumbItem[] = role
    ? [{ label: NAV.dashboard, to: homeTo }]
    : [{ label: NAV.home, to: '/' }];

  if (pathname === '/admin/reconciliation') {
    items.push({ label: 'Rekonsiliasi' });
    return items;
  }

  if (pathname.startsWith('/verify/donation/')) {
    items.push({ label: 'Verifikasi donasi' });
    return items;
  }
  if (pathname.endsWith('/donate') && pathname.startsWith('/campaigns/')) {
    const parentLabel = role && canCreateCampaign(role)
      ? NAV.myCampaigns
      : NAV.exploreCampaigns;
    items.push({ label: parentLabel, to: campaignListBackPath(role) });
    items.push({ label: 'Donasi' });
    return items;
  }
  if (pathname === '/campaigns' && search.includes('mine=1')) {
    items.push({ label: NAV.myCampaigns });
    return items;
  }
  if (pathname === '/campaigns') {
    items.push({ label: NAV.exploreCampaigns });
    return items;
  }
  if (pathname === '/campaigns/new') {
    items.push({ label: NAV.myCampaigns, to: '/campaigns?mine=1' });
    items.push({ label: NAV.createCampaign });
    return items;
  }
  if (pathname.startsWith('/campaigns/') && pathname !== '/campaigns/new') {
    const parentLabel = role && canCreateCampaign(role)
      ? NAV.myCampaigns
      : NAV.exploreCampaigns;
    items.push({
      label: parentLabel,
      to: campaignListBackPath(role),
    });
    items.push({
      label: options?.entityTitle ?? NAV.campaignDetail,
    });
    return items;
  }
  if (pathname === '/donor/donations') {
    items.push({ label: NAV.donationHistory });
    return items;
  }
  if (pathname === '/organizer/donations') {
    items.push({ label: NAV.incomingDonations });
    return items;
  }
  if (pathname.endsWith('/profile')) {
    items.push({ label: NAV.profile });
    return items;
  }

  items.push({ label: 'Halaman' });
  return items;
}

export function pageIconForPath(
  pathname: string,
  search: string,
  role: string,
): LucideIcon {
  if (pathname === '/campaigns/new') {
    return Plus;
  }
  if (pathname.startsWith('/campaigns/') && pathname !== '/campaigns/new') {
    return FolderKanban;
  }
  if (pathname === '/donor/donations') {
    return Heart;
  }
  if (pathname === '/organizer/donations') {
    return Receipt;
  }
  if (pathname.endsWith('/profile')) {
    return User;
  }
  if (pathname === '/campaigns' && search.includes('mine=1')) {
    return FolderKanban;
  }
  if (pathname === '/campaigns') {
    return Search;
  }

  const navItems = workspaceNavForRole(role);
  const activeItem = navItems.find((item) => navIsActive(item, pathname, search));
  return activeItem?.icon ?? LayoutDashboard;
}
