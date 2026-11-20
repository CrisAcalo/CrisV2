'use client';

import { AdminContentList } from '@/src/presentation/components/admin/AdminContentList';
import { AdminOrigin, AdminRecord, formatAdminDate } from '@/src/presentation/components/admin/AdminTableFields';
import { CertificateFormModal } from '@/src/presentation/components/admin/CertificateFormModal';
import { useCertificates, useSoftDeleteCertificate } from '@/src/presentation/hooks/useCertificates';
import { publicHttpUrl } from '@/src/presentation/utils/publicHttpUrl';

export default function AdminCertificatePage() {
  const query = useCertificates();
  const remove = useSoftDeleteCertificate();

  return <AdminContentList
    title="Certificados"
    description="Organiza las credenciales y enlaces que muestras en tu portafolio."
    href="/admin/certificates"
    createLabel="Nuevo certificado"
    emptyTitle="Aún no hay certificados"
    query={query}
    remove={remove}
    itemLabel={(item) => item.name}
    searchText={(item) => [item.name, item.issuingOrganization, item.isImportedFromLinkedIn ? 'LinkedIn' : 'Manual'].join(' ')}
    columns={[
      { label: 'Certificado', cell: (item) => <AdminRecord title={item.name} detail={item.issuingOrganization} /> },
      { label: 'Expedición', size: 'date', cell: (item) => formatAdminDate(item.issueDate, true) },
      { label: 'Origen', size: 'status', cell: (item) => <AdminOrigin imported={item.isImportedFromLinkedIn} /> },
      { label: 'Credencial', size: 'link', cell: (item) => {
        const href = publicHttpUrl(item.credentialUrl);
        return href
          ? <a className="admin-record-link" href={href} target="_blank" rel="noreferrer">Ver credencial<span className="sr-only"> de {item.name}</span></a>
          : '—';
      } },
    ]}
    form={({ item, ...props }) => <CertificateFormModal {...props} certificateToEdit={item} />}
  />;
}
