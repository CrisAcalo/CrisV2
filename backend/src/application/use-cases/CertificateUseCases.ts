import { ICertificateRepository } from '../../domain/repositories/ICertificateRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Certificate } from '../../domain/entities';

export type CreateCertificateDTO = Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateCertificateDTO = Partial<CreateCertificateDTO>;

export class CertificateUseCases {
    constructor(private certificateRepository: ICertificateRepository) { }

    async getAllCertificates(): Promise<Certificate[]> {
        return this.certificateRepository.findAll();
    }

    async getCertificateById(id: string): Promise<Certificate> {
        const certificate = await this.certificateRepository.findById(id);
        if (!certificate) throw new NotFoundError('Certificado no encontrado');
        return certificate;
    }

    async createCertificate(data: CreateCertificateDTO): Promise<Certificate> {
        return this.certificateRepository.create(data);
    }

    async updateCertificate(id: string, data: UpdateCertificateDTO): Promise<Certificate> {
        const certificate = await this.certificateRepository.update(id, data);
        if (!certificate) throw new NotFoundError('Certificado no encontrado');
        return certificate;
    }

    async deleteCertificate(id: string): Promise<void> {
        const deleted = await this.certificateRepository.delete(id);
        if (!deleted) throw new NotFoundError('Certificado no encontrado');
    }

    async softDeleteCertificate(id: string): Promise<void> {
        const deleted = await this.certificateRepository.softDelete(id);
        if (!deleted) throw new NotFoundError('Certificado no encontrado');
    }

    async restoreCertificate(id: string): Promise<void> {
        const restored = await this.certificateRepository.restore(id);
        if (!restored) throw new NotFoundError('Certificado no encontrado');
    }
}
