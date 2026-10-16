import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export function WorkspaceLayout() {
  useEffect(() => {
    document.body.classList.add('workspace-active');
    return () => document.body.classList.remove('workspace-active');
  }, []);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-trust-bg text-trust-navy"
      style={{ background: '#F4F4F5', color: '#18181B' }}
    >
      <AppHeader />
      <main
        className="workspace-content workspace-main flex min-h-0 flex-1 basis-0 flex-col overflow-hidden pb-4 pt-[calc(var(--height-header)+1rem)] sm:pb-5 sm:pt-[calc(var(--height-header)+1.25rem)]"
      >
        <div className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
