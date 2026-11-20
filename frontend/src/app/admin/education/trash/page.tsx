'use client';

import { AdminTrashList } from '@/src/presentation/components/admin/AdminTrashList';
import { AdminPeriod, AdminRecord } from '@/src/presentation/components/admin/AdminTableFields';
import { useEducations, useHardDeleteEducation, useRestoreEducation } from '@/src/presentation/hooks/useHistory';

export default function AdminEducationTrashPage() {
  const query = useEducations(true);
  const restore = useRestoreEducation();
  const remove = useHardDeleteEducation();

  return <AdminTrashList
    name="Educación"
    href="/admin/education"
    query={query}
    restore={restore.mutateAsync}
    remove={remove}
    itemLabel={(item) => item.degree}
    searchText={(item) => [item.degree, item.institution, item.isImportedFromLinkedIn ? 'LinkedIn' : 'Manual'].join(' ')}
    columns={[
      { label: 'Título e institución', cell: (item) => <AdminRecord title={item.degree} detail={item.institution} /> },
      { label: 'Período', size: 'date', cell: (item) => <AdminPeriod start={item.startDate} end={item.endDate} /> },
    ]}
  />;
}
