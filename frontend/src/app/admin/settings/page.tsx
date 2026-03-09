'use client';

import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '../../../presentation/hooks/useSettings';
import { useSyncLinkedIn } from '../../../presentation/hooks/useLinkedIn';
import { Card, Input, Button } from '../../../presentation/components/common';
import { Save, RefreshCw } from 'lucide-react';

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
    await updateSettingsMutation.mutateAsync({ linkedInUrn: urn });
    alert('URN actualizado correctamente.');
  };

  if (isSettingsLoading) return <div className="p-8 text-slate-500">Cargando configuraciones...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración del Sistema</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Administra los parámetros globales y la integración con LinkedIn.</p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Integración LinkedIn (RapidAPI)</h2>
        <div className="space-y-4 max-w-lg">
          <Input 
            label="LinkedIn URN"
            placeholder="ACoAADWA... (Ejemplo)"
            value={urn}
            onChange={(e) => setUrn(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            Este identificador único permite a RapidAPI escanear y sincronizar tu información.
          </p>
          <Button 
            onClick={handleSaveUrn} 
            isLoading={updateSettingsMutation.isPending}
            className="gap-2"
          >
            <Save className="w-4 h-4" /> Guardar URN
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Sincronización Manual</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
          Ejecuta estos procesos de sincronización bajo demanda. Ten en cuenta que si el proceso purgará la información anterior importada de LinkedIn e instalará los datos más recientes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="gap-2 justify-center"
            onClick={() => syncExperiences.mutate()}
            isLoading={syncExperiences.isPending}
            disabled={!urn}
          >
            <RefreshCw className="w-4 h-4" /> Sync Experiencias
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 justify-center"
            onClick={() => syncEducations.mutate()}
            isLoading={syncEducations.isPending}
            disabled={!urn}
          >
            <RefreshCw className="w-4 h-4" /> Sync Educación
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 justify-center"
            onClick={() => syncCertificates.mutate()}
            isLoading={syncCertificates.isPending}
            disabled={!urn}
          >
            <RefreshCw className="w-4 h-4" /> Sync Certificados
          </Button>
        </div>
      </Card>
    </div>
  );
}
