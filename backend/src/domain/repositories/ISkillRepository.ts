import { Skill } from '../entities';

export interface ISkillRepository {
    findAll(includeDeleted?: boolean): Promise<Skill[]>;
    findById(id: string): Promise<Skill | null>;
    findByNormalizedName(normalizedName: string): Promise<Skill | null>;
    create(data: { name: string; normalizedName: string; isFromLinkedIn?: boolean; isPublic?: boolean }): Promise<Skill>;
    update(id: string, data: Partial<Pick<Skill, 'name' | 'isFromLinkedIn' | 'isPublic'>>): Promise<Skill | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
    /**
     * For each name in the list: normalize it, find existing or create, and return the array.
     * Never deletes existing skills.
     */
    upsertMany(names: string[], isFromLinkedIn?: boolean): Promise<Skill[]>;
}
