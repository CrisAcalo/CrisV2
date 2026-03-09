import { IExperienceRepository } from '../../domain/repositories/IExperienceRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Experience } from '../../domain/entities';

export type CreateExperienceDTO = Omit<Experience, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateExperienceDTO = Partial<CreateExperienceDTO>;

export class ExperienceUseCases {
    constructor(private experienceRepository: IExperienceRepository) { }

    async getAllExperiences(includeDeleted = false): Promise<Experience[]> {
        return this.experienceRepository.findAll(includeDeleted);
    }

    async getExperienceById(id: string): Promise<Experience> {
        const experience = await this.experienceRepository.findById(id);
        if (!experience) throw new NotFoundError('Experiencia no encontrada');
        return experience;
    }

    async createExperience(data: CreateExperienceDTO): Promise<Experience> {
        return this.experienceRepository.create(data);
    }

    async updateExperience(id: string, data: UpdateExperienceDTO): Promise<Experience> {
        const experience = await this.experienceRepository.update(id, data);
        if (!experience) throw new NotFoundError('Experiencia no encontrada');
        return experience;
    }

    async deleteExperience(id: string): Promise<void> {
        const deleted = await this.experienceRepository.delete(id);
        if (!deleted) throw new NotFoundError('Experiencia no encontrada');
    }

    async softDeleteExperience(id: string): Promise<void> {
        const deleted = await this.experienceRepository.softDelete(id);
        if (!deleted) throw new NotFoundError('Experiencia no encontrada');
    }

    async restoreExperience(id: string): Promise<void> {
        const restored = await this.experienceRepository.restore(id);
        if (!restored) throw new NotFoundError('Experiencia no encontrada');
    }
}
