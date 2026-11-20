'use client';

import { AdminContentList } from '@/src/presentation/components/admin/AdminContentList';
import { AdminOrigin, AdminPeriod, AdminRecord } from '@/src/presentation/components/admin/AdminTableFields';
import { ExperienceFormModal } from '@/src/presentation/components/admin/ExperienceFormModal';
import { useExperiences, useSoftDeleteExperience } from '@/src/presentation/hooks/useHistory';

export default function AdminExperiencePage() {
  const query = useExperiences();
  const remove = useSoftDeleteExperience();

  return <AdminContentList
    title="Experiencia"
    description="Gestiona los cargos y las empresas de tu trayectoria profesional."
    href="/admin/experience"
    createLabel="Nueva experiencia"
    emptyTitle="Aún no hay experiencias"
    query={query}
    remove={remove}
    itemLabel={(item) => item.role}
    searchText={(item) => [item.role, item.company, item.description, item.isImportedFromLinkedIn ? 'LinkedIn' : 'Manual'].join(' ')}
    columns={[
      { label: 'Cargo y empresa', cell: (item) => <AdminRecord title={item.role} detail={item.company} /> },
      { label: 'Período', size: 'date', cell: (item) => <AdminPeriod start={item.startDate} end={item.endDate} /> },
      { label: 'Descripción', cell: (item) => <p className="admin-cell-preview" title={item.description || undefined}>{item.description || '—'}</p> },
      { label: 'Origen', size: 'status', cell: (item) => <AdminOrigin imported={item.isImportedFromLinkedIn} /> },
    ]}
    form={({ item, ...props }) => <ExperienceFormModal {...props} experienceToEdit={item} />}
  />;
}
