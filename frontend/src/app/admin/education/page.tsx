'use client';

import { AdminContentList } from '@/src/presentation/components/admin/AdminContentList';
import { AdminOrigin, AdminPeriod, AdminRecord } from '@/src/presentation/components/admin/AdminTableFields';
import { EducationFormModal } from '@/src/presentation/components/admin/EducationFormModal';
import { useEducations, useSoftDeleteEducation } from '@/src/presentation/hooks/useHistory';

export default function AdminEducationPage() {
  const query = useEducations();
  const remove = useSoftDeleteEducation();

  return <AdminContentList
    title="Educación"
    description="Gestiona los estudios e instituciones de tu trayectoria académica."
    href="/admin/education"
    createLabel="Nuevo estudio"
    emptyTitle="Aún no hay estudios"
    query={query}
    remove={remove}
    itemLabel={(item) => item.degree}
    searchText={(item) => [item.degree, item.institution, item.isImportedFromLinkedIn ? 'LinkedIn' : 'Manual'].join(' ')}
    columns={[
      { label: 'Título e institución', cell: (item) => <AdminRecord title={item.degree} detail={item.institution} /> },
      { label: 'Período', size: 'date', cell: (item) => <AdminPeriod start={item.startDate} end={item.endDate} /> },
      { label: 'Origen', size: 'status', cell: (item) => <AdminOrigin imported={item.isImportedFromLinkedIn} /> },
    ]}
    form={({ item, ...props }) => <EducationFormModal {...props} educationToEdit={item} />}
  />;
}
