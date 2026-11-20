'use client';

import { AdminTrashList } from '@/src/presentation/components/admin/AdminTrashList';
import { AdminRecord, formatAdminDate } from '@/src/presentation/components/admin/AdminTableFields';
import { useCertificates, useHardDeleteCertificate, useRestoreCertificate } from '@/src/presentation/hooks/useCertificates';

export default function AdminCertificateTrashPage() {
  const query = useCertificates(true);
  const restore = useRestoreCertificate();
  const remove = useHardDeleteCertificate();

  return <AdminTrashList
    name="Certificados"
    href="/admin/certificates"
    query={query}
    restore={restore.mutateAsync}
    remove={remove}
    itemLabel={(item) => item.name}
    searchText={(item) => [item.name, item.issuingOrganization, item.isImportedFromLinkedIn ? 'LinkedIn' : 'Manual'].join(' ')}
    columns={[
      { label: 'Certificado', cell: (item) => <AdminRecord title={item.name} detail={item.issuingOrganization} /> },
      { label: 'Expedición', size: 'date', cell: (item) => formatAdminDate(item.issueDate, true) },
    ]}
  />;
}
