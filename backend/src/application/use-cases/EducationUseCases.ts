import { IEducationRepository } from '../../domain/repositories/IEducationRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Education } from '../../domain/entities';

export type CreateEducationDTO = Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateEducationDTO = Partial<CreateEducationDTO>;

export class EducationUseCases {
    constructor(private educationRepository: IEducationRepository) { }

    async getAllEducations(includeDeleted = false): Promise<Education[]> {
        return this.educationRepository.findAll(includeDeleted);
    }

    async getEducationById(id: string): Promise<Education> {
        const education = await this.educationRepository.findById(id);
        if (!education) throw new NotFoundError('Educación no encontrada');
        return education;
    }

    async createEducation(data: CreateEducationDTO): Promise<Education> {
        return this.educationRepository.create(data);
    }

    async updateEducation(id: string, data: UpdateEducationDTO): Promise<Education> {
        const education = await this.educationRepository.update(id, data);
        if (!education) throw new NotFoundError('Educación no encontrada');
        return education;
    }

    async deleteEducation(id: string): Promise<void> {
        const deleted = await this.educationRepository.delete(id);
        if (!deleted) throw new NotFoundError('Educación no encontrada');
    }

    async softDeleteEducation(id: string): Promise<void> {
        const deleted = await this.educationRepository.softDelete(id);
        if (!deleted) throw new NotFoundError('Educación no encontrada');
    }

    async restoreEducation(id: string): Promise<void> {
        const restored = await this.educationRepository.restore(id);
        if (!restored) throw new NotFoundError('Educación no encontrada');
    }
}
