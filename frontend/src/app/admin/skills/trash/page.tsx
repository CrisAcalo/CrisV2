'use client';

import { useSkills, useRestoreSkill, useHardDeleteSkill } from '../../../../presentation/hooks/useSkills';
import { Button, Card, ConfirmModal } from '../../../../presentation/components/common';
import { useState } from 'react';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminSkillsTrashPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useSkills(true);
  const restoreMutation = useRestoreSkill();
  const hardDeleteMutation = useHardDeleteSkill();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [skillToHardDelete, setSkillToHardDelete] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success('Skill restaurada');
    } catch {
      toast.error('No se pudo restaurar la skill');
    }
  };

  const confirmHardDelete = (id: string) => {
    setSkillToHardDelete(id);
    setIsConfirmOpen(true);
  };

  const executeHardDelete = async () => {
    if (!skillToHardDelete) return;
    try {
      await hardDeleteMutation.mutateAsync(skillToHardDelete);
      toast.success('Skill eliminada permanentemente');
      setIsConfirmOpen(false);
      setSkillToHardDelete(null);
    } catch {
      toast.error('No se pudo eliminar la skill');
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando papelera...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error al cargar la papelera.</div>;

  const skills = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Papelera — Skills</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {skills.length} skill{skills.length !== 1 ? 's' : ''} eliminada{skills.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {skills.length === 0 ? (
        <Card className="text-center py-16">
          <p style={{ color: 'var(--text-muted)' }}>La papelera está vacía.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
                <tr>
                  <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Nombre</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Normalizado</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Eliminado el</th>
                  <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill, i) => (
                  <motion.tr
                    key={skill.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--surface-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold line-through opacity-60" style={{ color: 'var(--text-primary)' }}>
                        {skill.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
                        {skill.normalizedName}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {skill.deletedAt ? new Date(skill.deletedAt).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="success-light" size="sm" className="gap-1.5" onClick={() => handleRestore(skill.id)}>
                          <RefreshCw className="w-4 h-4" /> Restaurar
                        </Button>
                        <Button variant="danger-light" size="sm" className="gap-1.5" onClick={() => confirmHardDelete(skill.id)}>
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeHardDelete}
        title="Eliminar permanentemente"
        message="Esta acción es irreversible. ¿Eliminar esta skill definitivamente?"
        confirmText="Eliminar"
        isDestructive={true}
      />
    </div>
  );
}
