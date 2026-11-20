'use client';

import { AdminTrashList } from '@/src/presentation/components/admin/AdminTrashList';
import { AdminRecord } from '@/src/presentation/components/admin/AdminTableFields';
import { useSkills, useHardDeleteSkill, useRestoreSkill } from '@/src/presentation/hooks/useSkills';

export default function AdminSkillsTrashPage() {
  const query = useSkills(true);
  const restore = useRestoreSkill();
  const remove = useHardDeleteSkill();

  return <AdminTrashList
    name="Tecnologías"
    href="/admin/skills"
    query={query}
    restore={restore.mutateAsync}
    remove={remove}
    itemLabel={(item) => item.name}
    searchText={(item) => [item.name, item.normalizedName].join(' ')}
    columns={[
      { label: 'Tecnología', cell: (item) => <AdminRecord title={item.name} detail={item.normalizedName} /> },
    ]}
  />;
}
