'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { useCreateCertificate, useUpdateCertificate } from '../../hooks/useCertificates';
import type { Certificate } from '../../../domain/entities';
import { AdminFormActions, AdminInput } from './AdminFormFields';
import { dateField, dateInputValue, httpUrlField, showFormError, utcDate } from './adminFormValidation';
import styles from './AdminDialog.module.css';

const schema = z.object({
  name: z.string().trim().min(1, 'Escribe el nombre del certificado'),
  issuingOrganization: z.string().trim().min(1, 'Escribe la organización emisora'),
  issueDate: dateField,
  credentialUrl: httpUrlField,
});

type Values = z.infer<typeof schema>;
const defaults: Values = {
  name: '', issuingOrganization: '', issueDate: '', credentialUrl: '',
};

export function CertificateFormModal({ isOpen, onClose, certificateToEdit }: {
  isOpen: boolean;
  onClose: () => void;
  certificateToEdit?: Certificate | null;
}) {
  const create = useCreateCertificate();
  const update = useUpdateCertificate();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const busy = isSubmitting;

  useEffect(() => {
    if (!isOpen) return;
    reset(certificateToEdit ? {
      name: certificateToEdit.name,
      issuingOrganization: certificateToEdit.issuingOrganization,
      issueDate: dateInputValue(certificateToEdit.issueDate),
      credentialUrl: certificateToEdit.credentialUrl ?? '',
    } : defaults);
  }, [isOpen, certificateToEdit, reset]);

  async function submit(data: Values) {
    const payload = {
      ...data,
      issueDate: utcDate(data.issueDate),
      credentialUrl: data.credentialUrl || null,
    };
    try {
      if (certificateToEdit) {
        await update.mutateAsync({ id: certificateToEdit.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success(certificateToEdit ? 'Certificado actualizado' : 'Certificado creado');
      onClose();
    } catch (error) {
      showFormError(error, schema.shape, setError, 'No se pudo guardar el certificado.');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} busy={busy} title={certificateToEdit ? 'Editar certificado' : 'Nuevo certificado'}>
      <form noValidate className={styles.form} onSubmit={handleSubmit(submit)}>
        <fieldset className={styles.fieldset} disabled={isSubmitting}>
          <AdminInput label="Nombre del certificado" required autofocus {...register('name')} error={errors.name?.message} />
          <AdminInput label="Organización emisora" required {...register('issuingOrganization')} error={errors.issuingOrganization?.message} />
          <AdminInput label="Fecha de expedición" type="date" required {...register('issueDate')} error={errors.issueDate?.message} />
          <AdminInput label="URL de la credencial" type="url" {...register('credentialUrl')} error={errors.credentialUrl?.message} />
        </fieldset>
        {errors.root?.server?.message && <p role="alert" className={styles.notice}>{errors.root.server.message}</p>}
        <AdminFormActions busy={busy} onClose={onClose} submitLabel={certificateToEdit ? 'Guardar cambios' : 'Crear certificado'} />
      </form>
    </Modal>
  );
}
