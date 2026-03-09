/** Normalize a skill name: lowercase + remove spaces, dots, dashes, underscores */
export const normalizeSkillName = (name: string): string =>
    name.toLowerCase().replace(/[\s.\-_]/g, '');
