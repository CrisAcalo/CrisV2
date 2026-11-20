'use client';

import { useState, type FormEvent } from 'react';
import { Linkedin, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AdminAction } from '../../../presentation/components/admin/AdminAction';
import { AdminPageHeader } from '../../../presentation/components/admin/AdminPageHeader';
import { AdminState } from '../../../presentation/components/admin/AdminState';
import { useSettings, useUpdateSettings } from '../../../presentation/hooks/useSettings';
import { useSyncLinkedIn } from '../../../presentation/hooks/useLinkedIn';
import { getApiErrorMessage } from '../../../presentation/utils/apiErrors';

export default function AdminSettingsPage() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const { syncExperiences, syncEducations, syncCertificates } = useSyncLinkedIn();
  const [draft, setDraft] = useState<string | null>(null);
  const savedUrn = settings.data?.data?.linkedInUrn?.trim() ?? '';
  const urn = draft ?? savedUrn;
  const changed = urn.trim() !== savedUrn;
  const imports = [
    { label: 'Experiencia', action: 'Sincronizar experiencia', mutation: syncExperiences },
    { label: 'Educación', action: 'Sincronizar educación', mutation: syncEducations },
    { label: 'Certificados', action: 'Sincronizar certificados', mutation: syncCertificates },
  ];
  const syncing = imports.some(({ mutation }) => mutation.isPending);
  const syncDisabled = !savedUrn || changed || updateSettings.isPending || syncing;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!changed || syncing || updateSettings.isPending) return;

    try {
      await updateSettings.mutateAsync({ linkedInUrn: urn.trim() || null });
      setDraft(null);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la configuración'));
    }
  }

  return (
    <div className="admin-settings">
      <AdminPageHeader title="Configuración" description="Conecta tu perfil e importa registros desde LinkedIn." />
      {settings.isPending ? (
        <AdminState kind="loading" title="Cargando configuración…" />
      ) : settings.isError ? (
        <AdminState kind="error" title="No se pudo cargar la configuración" onRetry={() => { void settings.refetch(); }} />
      ) : (
        <div className="admin-settings-content">
          <section className="admin-section" aria-labelledby="linkedin-profile">
            <div className="admin-section-head">
              <h2 id="linkedin-profile"><Linkedin size={20} aria-hidden="true" /> Perfil de LinkedIn</h2>
            </div>
            <form className="admin-section-body" onSubmit={save}>
              <div>
                <label htmlFor="linkedin-urn">Identificador de LinkedIn (URN)</label>
                <input
                  id="linkedin-urn"
                  value={urn}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-describedby="linkedin-urn-help"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={updateSettings.isPending || syncing}
                />
                <p id="linkedin-urn-help" className="admin-settings-help">
                  Identifica el perfil que se usará para importar tu trayectoria.
                </p>
              </div>
              <div>
                <AdminAction
                  type="submit"
                  tone="primary"
                  icon={<Save size={17} aria-hidden="true" />}
                  pending={updateSettings.isPending}
                  disabled={!changed || syncing}
                >
                  Guardar cambios
                </AdminAction>
              </div>
            </form>
          </section>

          <section className="admin-section" aria-labelledby="linkedin-import">
            <div className="admin-section-head">
              <h2 id="linkedin-import"><RefreshCw size={19} aria-hidden="true" /> Importar desde LinkedIn</h2>
            </div>
            <div className="admin-section-body">
              <p className="admin-section-note">
                Al sincronizar una sección se reemplazan sus registros importados anteriormente. Los registros creados a mano se conservan.
              </p>
              {(changed || !savedUrn) && (
                <p className="admin-settings-help" role="status">Guarda el identificador del perfil para habilitar la sincronización.</p>
              )}
              <ul className="admin-sync-list">
                {imports.map(({ label, action, mutation }) => (
                  <li className="admin-sync-row" key={label}>
                    <div>
                      <h3>{label}</h3>
                      {mutation.isSuccess && <p className="admin-sync-result" role="status">{mutation.data.data.message}</p>}
                    </div>
                    <AdminAction
                      aria-label={action}
                      icon={<RefreshCw size={17} aria-hidden="true" />}
                      disabled={syncDisabled}
                      pending={mutation.isPending}
                      onClick={() => { if (!syncDisabled) mutation.mutate(); }}
                    >
                      {mutation.isPending ? 'Sincronizando…' : 'Sincronizar'}
                    </AdminAction>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
