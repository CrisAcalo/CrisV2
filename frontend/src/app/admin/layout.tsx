'use client';

import { AdminGuard } from '../../presentation/components/admin/AdminGuard';
import { AdminSidebar } from '../../presentation/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar (mobile spacing + breadcrumb area) */}
          <header className="md:hidden h-16 flex-shrink-0" />

          <main className="flex-1 overflow-auto custom-scrollbar">
            <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
