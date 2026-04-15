export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'BASIC';
}

export interface SkillRef {
    id: string;
    name: string;
}

export interface Skill {
    id: string;
    name: string;
    normalizedName: string;
    isFromLinkedIn: boolean;
    isPublic: boolean;
    experiences?: Array<{ id: string; role: string; company: string }>;
    educations?: Array<{ id: string; institution: string; degree: string }>;
    projects?: Array<{ id: string; title: string }>;
    deletedAt?: string | null;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    skills: SkillRef[];
    repoUrl?: string;
    liveUrl?: string;
    isPublished: boolean;
    deletedAt?: string | null;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    isImportedFromLinkedIn: boolean;
    skills?: SkillRef[];
    deletedAt?: string | null;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string | null;
    isImportedFromLinkedIn?: boolean;
    skills?: SkillRef[];
    deletedAt?: string | null;
}

export interface Certificate {
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date | string;
    credentialUrl?: string | null;
    isImportedFromLinkedIn?: boolean;
    deletedAt?: string | null;
}

export interface Message {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    deletedAt?: string | null;
}

export interface SystemConfiguration {
    id: string;
    linkedInUrn?: string | null;
    theme: string;
}
