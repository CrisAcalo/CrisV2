import { Experience, Education, Certificate } from '../../domain/entities';

export interface FreshLinkedInExperience {
    title: string;
    company: { name: string; };
    date?: { start?: string; end?: string; };
    description?: string;
    skills?: string[];
}

export interface FreshLinkedInEducation {
    school: string;
    degree?: string;
    date?: { start?: string; end?: string; };
    skills?: string[];
}

export interface FreshLinkedInCertificate {
    title: string;
    authority: string;
    credential_url?: string | null;
    issued_at?: string;
}

export interface ILinkedInService {
    fetchExperiences(urn: string): Promise<FreshLinkedInExperience[]>;
    fetchEducations(urn: string): Promise<FreshLinkedInEducation[]>;
    fetchCertificates(urn: string): Promise<FreshLinkedInCertificate[]>;

    mapExperiences(rawExp: FreshLinkedInExperience[]): (Experience & { skillNames: string[] })[];
    mapEducations(rawEdu: FreshLinkedInEducation[]): (Education & { skillNames: string[] })[];
    mapCertificates(rawCert: FreshLinkedInCertificate[]): Certificate[];
}
