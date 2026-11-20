'use client';

import { AdminTrashList } from '@/src/presentation/components/admin/AdminTrashList';
import { AdminPeriod, AdminRecord } from '@/src/presentation/components/admin/AdminTableFields';
import { useExperiences, useHardDeleteExperience, useRestoreExperience } from '@/src/presentation/hooks/useHistory';

export default function AdminExperienceTrashPage() {
  const query = useExperiences(true);
  const restore = useRestoreExperience();
  const remove = useHardDeleteExperience();

  return <AdminTrashList
    name="Experiencia"
    href="/admin/experience"
    query={query}
    restore={restore.mutateAsync}
    remove={remove}
    itemLabel={(item) => item.role}
    searchText={(item) => [item.role, item.company, item.description, item.isImportedFromLinkedIn ? 'LinkedIn' : 'Manual'].join(' ')}
    columns={[
      { label: 'Cargo y empresa', cell: (item) => <AdminRecord title={item.role} detail={item.company} /> },
      { label: 'Período', size: 'date', cell: (item) => <AdminPeriod start={item.startDate} end={item.endDate} /> },
    ]}
  />;
}
