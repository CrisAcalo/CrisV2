export enum Role {
    ADMIN = 'ADMIN',
    BASIC = 'BASIC'
}

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface SkillRef {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    repoUrl?: string | null;
    liveUrl?: string | null;
    isPublished: boolean;
    skills?: SkillRef[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    startDate: Date;
    endDate?: Date | null;
    description?: string | null;
    isImportedFromLinkedIn: boolean;
    skills?: SkillRef[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    startDate: Date;
    endDate?: Date | null;
    isImportedFromLinkedIn?: boolean;
    skills?: SkillRef[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface Skill {
    id: string;
    name: string;
    normalizedName: string;
    isFromLinkedIn: boolean;
    isPublic: boolean;
    /** Experiences this skill is connected to */
    experiences?: Array<{ id: string; role: string; company: string }>;
    /** Education records this skill is connected to */
    educations?: Array<{ id: string; institution: string; degree: string }>;
    /** Projects this skill is connected to */
    projects?: Array<{ id: string; title: string }>;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface Certificate {
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    credentialUrl?: string | null;
    isImportedFromLinkedIn?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface Message {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    content: string;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
