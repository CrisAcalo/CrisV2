export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'BASIC';
}

export interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    techStack: string[];
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
    deletedAt?: string | null;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string | null;
    isImportedFromLinkedIn?: boolean;
    deletedAt?: string | null;
}

export interface Certificate {
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date | string;
    credentialUrl?: string | null;
    isImportedFromLinkedIn?: boolean;
}

export interface SystemConfiguration {
    id: string;
    linkedInUrn?: string | null;
    theme: string;
}
