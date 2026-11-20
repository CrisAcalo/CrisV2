'use client';

import { AdminContentList } from '@/src/presentation/components/admin/AdminContentList';
import { AdminBadge, AdminRecord, AdminTags } from '@/src/presentation/components/admin/AdminTableFields';
import { ProjectFormModal } from '@/src/presentation/components/admin/ProjectFormModal';
import { useProjects, useSoftDeleteProject } from '@/src/presentation/hooks/useProjects';

export default function AdminProjectPage() {
  const query = useProjects();
  const remove = useSoftDeleteProject();

  return <AdminContentList
    title="Proyectos"
    description="Organiza los proyectos y decide cuáles aparecen en tu portafolio."
    href="/admin/projects"
    createLabel="Nuevo proyecto"
    emptyTitle="Aún no hay proyectos"
    query={query}
    remove={remove}
    itemLabel={(item) => item.title}
    searchText={(item) => [item.title, item.description, item.isPublished ? 'Publicado' : 'Borrador', item.isFeatured ? 'Destacado' : '', ...(item.skills ?? []).map((skill) => skill.name)].join(' ')}
    columns={[
      { label: 'Proyecto', cell: (item) => <AdminRecord title={item.title} detail={item.description} /> },
      { label: 'Estado', size: 'status', cell: (item) => (
        <div className="flex flex-wrap gap-2">
          <AdminBadge tone={item.isPublished ? 'success' : 'neutral'}>{item.isPublished ? 'Publicado' : 'Borrador'}</AdminBadge>
          {item.isFeatured && <AdminBadge tone="accent">Destacado</AdminBadge>}
        </div>
      ) },
      { label: 'Tecnologías', cell: (item) => <AdminTags values={(item.skills ?? []).map((skill) => skill.name)} /> },
    ]}
    form={({ item, ...props }) => <ProjectFormModal {...props} projectToEdit={item} />}
  />;
}
