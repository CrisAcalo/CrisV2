'use client';

import { AdminGuard } from '../../presentation/components/admin/AdminGuard';
import { AdminFrame } from '../../presentation/components/admin/AdminSidebar';
import '../../presentation/styles/admin-theme.css';
import './admin-shell.css';
import './admin-tables.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <AdminGuard>
        <AdminFrame>{children}</AdminFrame>
      </AdminGuard>
    </div>
  );
}
