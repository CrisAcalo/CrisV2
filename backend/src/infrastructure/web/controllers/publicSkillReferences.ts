import type { SkillRef } from '../../../domain/entities';

export function publicSkillReferences(skills: SkillRef[] | undefined) {
    return skills
        ?.filter(skill => skill.isPublic === true && !skill.deletedAt)
        .map(({ id, name }) => ({ id, name }));
}
