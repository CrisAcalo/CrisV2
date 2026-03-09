import { ISkillRepository } from '../../domain/repositories/ISkillRepository';
import { NotFoundError, ConflictError } from '../../domain/errors/AppError';
import { Skill } from '../../domain/entities';
import { normalizeSkillName } from '../../domain/utils/normalizeSkillName';

export type CreateSkillDTO = { name: string; isFromLinkedIn?: boolean; isPublic?: boolean };
export type UpdateSkillDTO = Partial<Pick<Skill, 'name' | 'isFromLinkedIn' | 'isPublic'>>;

export class SkillUseCases {
    constructor(private skillRepository: ISkillRepository) { }

    async getAllSkills(includeDeleted = false): Promise<Skill[]> {
        return this.skillRepository.findAll(includeDeleted);
    }

    async getSkillById(id: string): Promise<Skill> {
        const skill = await this.skillRepository.findById(id);
        if (!skill) throw new NotFoundError('Skill no encontrada');
        return skill;
    }

    async createSkill(data: CreateSkillDTO): Promise<Skill> {
        const normalizedName = normalizeSkillName(data.name);
        const existing = await this.skillRepository.findByNormalizedName(normalizedName);
        if (existing) throw new ConflictError(`Ya existe una skill equivalente: "${existing.name}"`);
        return this.skillRepository.create({ ...data, normalizedName });
    }

    async updateSkill(id: string, data: UpdateSkillDTO): Promise<Skill> {
        if (data.name) {
            const normalizedName = normalizeSkillName(data.name);
            const existing = await this.skillRepository.findByNormalizedName(normalizedName);
            if (existing && existing.id !== id) {
                throw new ConflictError(`Ya existe una skill equivalente: "${existing.name}"`);
            }
        }
        const updated = await this.skillRepository.update(id, data);
        if (!updated) throw new NotFoundError('Skill no encontrada');
        return updated;
    }

    async deleteSkill(id: string): Promise<void> {
        const deleted = await this.skillRepository.delete(id);
        if (!deleted) throw new NotFoundError('Skill no encontrada');
    }

    async softDeleteSkill(id: string): Promise<void> {
        const deleted = await this.skillRepository.softDelete(id);
        if (!deleted) throw new NotFoundError('Skill no encontrada');
    }

    async restoreSkill(id: string): Promise<void> {
        const restored = await this.skillRepository.restore(id);
        if (!restored) throw new NotFoundError('Skill no encontrada');
    }
}
