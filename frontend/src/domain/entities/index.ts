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

export interface ProjectCaseStudy {
    problem?: string;
    contribution?: string;
    decision?: string;
    outcome?: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    skills: SkillRef[];
    repoUrl?: string | null;
    liveUrl?: string | null;
    isPublished: boolean;
    isFeatured?: boolean;
    hasCaseStudy?: boolean;
    caseStudy?: ProjectCaseStudy | null;
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
