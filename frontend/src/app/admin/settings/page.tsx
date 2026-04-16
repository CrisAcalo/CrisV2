'use client';

import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '../../../presentation/hooks/useSettings';
import { useSyncLinkedIn } from '../../../presentation/hooks/useLinkedIn';
import { Card, Input, Button } from '../../../presentation/components/common';
import { Save, RefreshCw, Linkedin, Database, Settings2, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { data: settingsData, isLoading: isSettingsLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const { syncExperiences, syncEducations, syncCertificates } = useSyncLinkedIn();

  const [urn, setUrn] = useState('');

  // Sincronizar estado local cuando llegan los datos del server
  useEffect(() => {
    if (settingsData?.data?.linkedInUrn) {
      setUrn(settingsData.data.linkedInUrn);
    }
  }, [settingsData]);

  const handleSaveUrn = async () => {
    try {
      await updateSettingsMutation.mutateAsync({ linkedInUrn: urn });
      toast.success('Configuración actualizada correctamente');
    } catch (err) {
      toast.error('Error al guardar la configuración');
    }
  };

  if (isSettingsLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando configuraciones...</div>;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-10 pb-20"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Settings2 className="w-8 h-8" style={{ color: 'var(--accent)' }} />
            Configuración
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Administra los parámetros globales y la sincronización con fuentes externas.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: API Settings */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <Card className="h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Linkedin size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--accent-faint)', color: 'var(--accent)' }}>
                  <Linkedin className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>LinkedIn Integration</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Input 
                    label="LinkedIn URN"
                    placeholder="Ej: ACoAADWA..."
                    value={urn}
                    onChange={(e) => setUrn(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-start gap-2 p-3 rounded-lg text-xs leading-relaxed" style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    <p>El URN es el identificador único de tu perfil necesario para que el Scraper de RapidAPI encuentre tu información.</p>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveUrn} 
                  isLoading={updateSettingsMutation.isPending}
                  className="w-full gap-2 shadow-lg shadow-purple-500/10"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Column: Sync Process */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ background: 'var(--accent-faint)', color: 'var(--accent)' }}>
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Procesos de Sincronización</h3>
            </div>

            <p className="mb-8 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              La sincronización permite importar automáticamente tu experiencia, educación y certificaciones directamente desde LinkedIn. 
              <span className="block mt-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                ⚠️ Nota: Al sincronizar se reemplazará cualquier información importada previamente por la versión más reciente.
              </span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SyncItem 
                title="Experiencia Laboral" 
                description="Importa cargos, empresas y periodos."
                icon={<Database className="w-4 h-4" />}
                onSync={() => syncExperiences.mutate()}
                isLoading={syncExperiences.isPending}
                disabled={!urn}
              />
              <SyncItem 
                title="Formación Académica" 
                description="Importa títulos, instituciones y fechas."
                icon={<Database className="w-4 h-4" />}
                onSync={() => syncEducations.mutate()}
                isLoading={syncEducations.isPending}
                disabled={!urn}
              />
              <SyncItem 
                title="Certificaciones" 
                description="Importa certificados y credenciales."
                icon={<Database className="w-4 h-4" />}
                onSync={() => syncCertificates.mutate()}
                isLoading={syncCertificates.isPending}
                disabled={!urn}
                className="sm:col-span-2"
              />
            </div>

            <div className="mt-8 p-4 rounded-xl flex items-center gap-3" style={{ background: 'linear-gradient(135deg, var(--accent-faint), transparent)', border: '1px solid var(--surface-border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface)', color: 'var(--accent)' }}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Recuerda que después de sincronizar, puedes editar manualmente cada registro en sus respectivas secciones del panel.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SyncItem({ title, description, icon, onSync, isLoading, disabled, className = "" }: { 
  title: string, 
  description: string, 
  icon: React.ReactNode,
  onSync: () => void,
  isLoading: boolean,
  disabled: boolean,
  className?: string
}) {
  return (
    <div 
      className={`p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between gap-4 group ${className}`}
      style={{ 
        background: 'var(--surface-raised)', 
        border: '1px solid var(--surface-border)',
      }}
    >
      <div>
        <h4 className="font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--accent)' }}>{icon}</span>
          {title}
        </h4>
        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      <Button 
        variant="secondary-light" 
        size="sm" 
        className="w-full gap-2 border-transparent bg-white/5 hover:bg-white/10"
        onClick={onSync}
        isLoading={isLoading}
        disabled={disabled}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        Sincronizar ahora
      </Button>
    </div>
  );
}
