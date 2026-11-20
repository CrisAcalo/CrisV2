'use client';

import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { AdminAction } from '@/src/presentation/components/admin/AdminAction';
import { AdminContentList } from '@/src/presentation/components/admin/AdminContentList';
import { AdminOrigin, AdminRecord, AdminTags } from '@/src/presentation/components/admin/AdminTableFields';
import { SkillFormModal } from '@/src/presentation/components/admin/SkillFormModal';
import { useSkills, useSoftDeleteSkill, useUpdateSkill } from '@/src/presentation/hooks/useSkills';
import { getApiErrorMessage } from '@/src/presentation/utils/apiErrors';
import type { Skill } from '@/src/domain/entities';

function relations(skill: Skill) {
  return [
    ...(skill.projects ?? []).map((project) => project.title),
    ...(skill.experiences ?? []).map((entry) => entry.role),
    ...(skill.educations ?? []).map((entry) => entry.institution),
  ];
}

export default function AdminSkillsPage() {
  const query = useSkills();
  const remove = useSoftDeleteSkill();
  const update = useUpdateSkill();

  async function changeVisibility(skill: Skill) {
    if (update.isPending) return;
    try {
      await update.mutateAsync({ id: skill.id, data: { isPublic: !skill.isPublic } });
      toast.success(skill.isPublic ? 'Tecnología oculta' : 'Tecnología visible');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar la visibilidad'));
    }
  }

  return <AdminContentList
    title="Tecnologías"
    description="Gestiona la visibilidad de las tecnologías y sus vínculos con el portafolio."
    href="/admin/skills"
    createLabel="Nueva tecnología"
    emptyTitle="Aún no hay tecnologías"
    query={query}
    remove={remove}
    itemLabel={(item) => item.name}
    searchText={(item) => [item.name, item.normalizedName, item.isFromLinkedIn ? 'LinkedIn' : 'Manual', ...relations(item)].join(' ')}
    columns={[
      { label: 'Tecnología', cell: (item) => <AdminRecord title={item.name} detail={item.normalizedName} /> },
      { label: 'Origen', size: 'status', cell: (item) => <AdminOrigin imported={item.isFromLinkedIn} /> },
      { label: 'Visibilidad', size: 'control', cell: (item) => (
        <AdminAction
          aria-label={item.isPublic
            ? `Visible. Ocultar ${item.name} del portafolio`
            : `Oculta. Hacer visible ${item.name} en el portafolio`}
          icon={item.isPublic ? <Eye size={17} /> : <EyeOff size={17} />}
          pending={update.isPending && update.variables?.id === item.id}
          disabled={update.isPending}
          tone={item.isPublic ? 'success' : 'neutral'}
          onClick={() => changeVisibility(item)}
        >
          {item.isPublic ? 'Visible' : 'Oculta'}
        </AdminAction>
      ) },
      { label: 'Vínculos', cell: (item) => <AdminTags values={relations(item)} limit={2} /> },
    ]}
    form={({ item, ...props }) => <SkillFormModal {...props} skillToEdit={item} />}
  />;
}
