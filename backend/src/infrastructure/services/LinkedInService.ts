import axios from 'axios';
import { ILinkedInService, FreshLinkedInExperience, FreshLinkedInEducation, FreshLinkedInCertificate } from './ILinkedInService';
import { Experience, Education, Certificate } from '../../domain/entities';
import { BadRequestError } from '../../domain/errors/AppError';
import { env } from '../../config/env';

export class LinkedInService implements ILinkedInService {
    private readonly API_HOST = 'fresh-linkedin-scraper-api.p.rapidapi.com';
    private readonly BASE_URL = `https://${this.API_HOST}/api/v1/user`;

    private getHeaders() {
        if (!env.LINKEDIN_API_TOKEN) throw new Error('LINKEDIN_API_TOKEN is missing');
        return {
            'x-rapidapi-key': env.LINKEDIN_API_TOKEN,
            'x-rapidapi-host': this.API_HOST
        };
    }

    async fetchExperiences(urn: string): Promise<FreshLinkedInExperience[]> {
        try {
            const response = await axios.get(`${this.BASE_URL}/experience`, {
                headers: this.getHeaders(),
                params: { urn, page: '1' }
            });
            return response.data?.data || [];
        } catch (error: any) {
            console.error('LinkedIn API Error (Experiences):', error?.response?.data || error.message);
            throw new BadRequestError('Failed to fetch Experiences from LinkedIn Scraper.');
        }
    }

    async fetchEducations(urn: string): Promise<FreshLinkedInEducation[]> {
        try {
            const response = await axios.get(`${this.BASE_URL}/educations`, {
                headers: this.getHeaders(),
                params: { urn, page: '1' }
            });
            return response.data?.data || [];
        } catch (error: any) {
            console.error('LinkedIn API Error (Educations):', error?.response?.data || error.message);
            // Si el perfil no tiene educacion, algunos APIs devuelven 404, tratamos de devolver vacio
            return [];
        }
    }

    async fetchCertificates(urn: string): Promise<FreshLinkedInCertificate[]> {
        try {
            const response = await axios.get(`${this.BASE_URL}/certifications`, {
                headers: this.getHeaders(),
                params: { urn, page: '1' }
            });
            return response.data?.data || [];
        } catch (error: any) {
            console.error('LinkedIn API Error (Certificates):', error?.response?.data || error.message);
            return [];
        }
    }

    private parseDateStr(dateStr?: string, defaultEnd: boolean = false): Date | null {
        if (!dateStr || dateStr.toLowerCase() === 'present') return defaultEnd ? null : new Date();
        return new Date(dateStr);
    }

    mapExperiences(rawExp: FreshLinkedInExperience[]): Experience[] {
        return rawExp.map(exp => ({
            id: '',
            role: exp.title,
            company: exp.company.name,
            startDate: this.parseDateStr(exp.date?.start) || new Date(),
            endDate: this.parseDateStr(exp.date?.end, true),
            description: exp.description || null,
            isImportedFromLinkedIn: true,
        }));
    }

    mapEducations(rawEdu: FreshLinkedInEducation[]): Education[] {
        return rawEdu.map(edu => ({
            id: '',
            institution: edu.school,
            degree: edu.degree || 'Grado no especificado',
            startDate: this.parseDateStr(edu.date?.start) || new Date(),
            endDate: this.parseDateStr(edu.date?.end, true),
            isImportedFromLinkedIn: true,
        }));
    }

    mapCertificates(rawCert: FreshLinkedInCertificate[]): Certificate[] {
        return rawCert.map(cert => ({
            id: '',
            name: cert.title,
            issuingOrganization: cert.authority,
            issueDate: this.parseDateStr(cert.issued_at) || new Date(),
            credentialUrl: cert.credential_url || null,
            isImportedFromLinkedIn: true,
        }));
    }
}
