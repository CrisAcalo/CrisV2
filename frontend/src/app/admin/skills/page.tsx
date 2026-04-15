'use client';

import { useState } from 'react';
import { useSkills, useSoftDeleteSkill, useUpdateSkill } from '../../../presentation/hooks/useSkills';
import { Button, Card, ConfirmModal } from '../../../presentation/components/common';
import { SkillFormModal } from '../../../presentation/components/admin/SkillFormModal';
import { Plus, Edit2, Trash2, Eye, EyeOff, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Skill } from '../../../domain/entities';
import { useRouter } from 'next/navigation';

export default function AdminSkillsPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useSkills(false);
  const softDeleteMutation = useSoftDeleteSkill();
  const updateMutation = useUpdateSkill();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

  const handleCreate = () => { setEditingSkill(null); setIsFormOpen(true); };
  const handleEdit = (skill: Skill) => { setEditingSkill(skill); setIsFormOpen(true); };
  const confirmDelete = (id: string) => { setSkillToDelete(id); setIsConfirmOpen(true); };

  const executeDelete = async () => {
    if (!skillToDelete) return;
    try {
      await softDeleteMutation.mutateAsync(skillToDelete);
      toast.success('Skill enviada a la papelera');
      setIsConfirmOpen(false);
      setSkillToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar la skill');
    }
  };

  const togglePublic = async (skill: Skill) => {
    try {
      await updateMutation.mutateAsync({ id: skill.id, data: { isPublic: !skill.isPublic } });
      toast.success(skill.isPublic ? 'Skill ocultada del portafolio' : 'Skill visible en el portafolio');
    } catch {
      toast.error('Error al cambiar visibilidad');
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando skills...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error cargando skills.</div>;

  const skills = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Skills</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {skills.length} skill{skills.length !== 1 ? 's' : ''} registradas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="danger-light" onClick={() => router.push('/admin/skills/trash')}>
            <Trash2 size={14} className="mr-1" /> Papelera
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus size={14} className="mr-1" /> Nueva Skill
          </Button>
        </div>
      </div>

      {skills.length === 0 ? (
        <Card className="text-center py-16">
          <p style={{ color: 'var(--text-muted)' }}>No hay skills registradas. ¡Crea la primera!</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
                <tr>
                  {['Nombre', 'Normalizado', 'LinkedIn', 'Público', 'Vinculado a', 'Acciones'].map(h => (
                    <th
                      key={h}
                      className={`px-6 py-4 font-semibold ${h === 'Acciones' ? 'text-right' : h === 'LinkedIn' || h === 'Público' ? 'text-center' : 'text-left'}`}
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skills.map((skill, i) => {
                  const refs = [
                    ...(skill.projects?.map(p => p.title) ?? []),
                    ...(skill.experiences?.map(e => e.role) ?? []),
                    ...(skill.educations?.map(e => e.institution) ?? []),
                  ];
                  return (
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
                      {/* Nombre */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {skill.name}
                        </span>
                      </td>

                      {/* Normalizado */}
                      <td className="px-5 py-4">
                        <code className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
                          {skill.normalizedName}
                        </code>
                      </td>

                      {/* LinkedIn */}
                      <td className="px-5 py-4 text-center">
                        {skill.isFromLinkedIn ? (
                          <Linkedin size={15} className="mx-auto text-[#0a66c2]" />
                        ) : (
                          <span className="relative inline-flex mx-auto">
                            <Linkedin size={15} className="text-red-500 opacity-70" />
                            {/* Red diagonal strike */}
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="block w-[140%] h-[1.5px] bg-red-500 rotate-45 rounded-full" />
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Público — clickable toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePublic(skill)}
                          title={skill.isPublic ? 'Ocultar del portafolio' : 'Hacer público'}
                          disabled={updateMutation.isPending}
                          className="mx-auto flex items-center justify-center w-7 h-7 rounded-full transition-all hover:scale-110"
                          style={{ background: skill.isPublic ? 'var(--success-surface, #d1fae5)' : 'var(--surface-raised)' }}
                        >
                          {skill.isPublic
                            ? <Eye size={14} className="text-emerald-500" />
                            : <EyeOff size={14} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                      </td>

                      {/* Vinculado a */}
                      <td className="px-5 py-4 max-w-[160px]">
                        <div className="flex flex-col gap-1">
                          {refs.length > 0
                            ? refs.slice(0, 2).map((r, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full truncate max-w-[140px] block"
                                title={r}
                                style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}
                              >
                                {r}
                              </span>
                            ))
                            : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                          {refs.length > 2 && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              +{refs.length - 2} más
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary-light" onClick={() => handleEdit(skill)} title="Editar">
                            <Edit2 size={13} />
                          </Button>
                          <Button variant="danger-light" onClick={() => confirmDelete(skill.id)} title="Mover a papelera">
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <SkillFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} skillToEdit={editingSkill} />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Mover a papelera"
        message="¿Mover esta skill a la papelera? Puedes restaurarla después."
        confirmText="Mover"
        isDestructive={false}
      />
    </div>
  );
}
