'use client';

import { AdminTrashList } from '@/src/presentation/components/admin/AdminTrashList';
import { AdminRecord } from '@/src/presentation/components/admin/AdminTableFields';
import { useProjects, useHardDeleteProject, useRestoreProject } from '@/src/presentation/hooks/useProjects';

export default function AdminProjectTrashPage() {
  const query = useProjects(true);
  const restore = useRestoreProject();
  const remove = useHardDeleteProject();

  return <AdminTrashList
    name="Proyectos"
    href="/admin/projects"
    query={query}
    restore={restore.mutateAsync}
    remove={remove}
    itemLabel={(item) => item.title}
    searchText={(item) => [item.title, item.description, item.isPublished ? 'Publicado' : 'Borrador', ...(item.skills ?? []).map((skill) => skill.name)].join(' ')}
    columns={[
      { label: 'Proyecto', cell: (item) => <AdminRecord title={item.title} detail={item.description} /> },
    ]}
  />;
}
