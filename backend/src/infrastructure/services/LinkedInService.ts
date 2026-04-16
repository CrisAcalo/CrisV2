import axios from 'axios';
import { ILinkedInService, FreshLinkedInExperience, FreshLinkedInEducation, FreshLinkedInCertificate } from './ILinkedInService';
import { Experience, Education, Certificate } from '../../domain/entities';
import { BadRequestError } from '../../domain/errors/AppError';
import { env } from '../../config/env';

export class LinkedInService implements ILinkedInService {
    private readonly API_HOST = 'fresh-linkedin-scraper-api.p.rapidapi.com';
    private readonly BASE_URL = `https://${this.API_HOST}/api/v1/user`;

    private getHeaders() {
        const token = env.LINKEDIN_API_TOKEN;
        console.log(`[LinkedInService] Checking Token: ${token ? 'PRESENT (ends in ...' + token.slice(-4) + ')' : 'MISSING'}`);
        if (!token) throw new Error('LINKEDIN_API_TOKEN is missing in environment variables');
        
        return {
            'x-rapidapi-key': token,
            'x-rapidapi-host': this.API_HOST
        };
    }

    async fetchExperiences(urn: string): Promise<FreshLinkedInExperience[]> {
        console.log(`[LinkedInService] Fetching Experiences for URN: ${urn}`);
        try {
            const response = await axios.get(`${this.BASE_URL}/experience`, {
                headers: this.getHeaders(),
                params: { urn, page: '1' }
            });
            const data = response.data?.data || [];
            console.log(`[LinkedInService] Experiences fetched successfully. Count: ${data.length}`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data || error.message;
            console.error('[LinkedInService] API Error (Experiences):', errorData);
            throw new BadRequestError(`Failed to fetch Experiences: ${JSON.stringify(errorData)}`);
        }
    }

    async fetchEducations(urn: string): Promise<FreshLinkedInEducation[]> {
        console.log(`[LinkedInService] Fetching Educations for URN: ${urn}`);
        try {
            const response = await axios.get(`${this.BASE_URL}/educations`, {
                headers: this.getHeaders(),
                params: { urn, page: '1' }
            });
            const data = response.data?.data || [];
            console.log(`[LinkedInService] Educations fetched successfully. Count: ${data.length}`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data || error.message;
            console.error('[LinkedInService] API Error (Educations):', errorData);
            // Some profiles might return 404/error if no education, we return empty but log it.
            return [];
        }
    }

    async fetchCertificates(urn: string): Promise<FreshLinkedInCertificate[]> {
        console.log(`[LinkedInService] Fetching Certificates for URN: ${urn}`);
        try {
            const response = await axios.get(`${this.BASE_URL}/certifications`, {
                headers: this.getHeaders(),
                params: { urn, page: '1' }
            });
            const data = response.data?.data || [];
            console.log(`[LinkedInService] Certificates fetched successfully. Count: ${data.length}`);
            return data;
        } catch (error: any) {
            const errorData = error?.response?.data || error.message;
            console.error('[LinkedInService] API Error (Certificates):', errorData);
            return [];
        }
    }

    private parseDateStr(dateStr?: string, defaultEnd: boolean = false): Date | null {
        if (!dateStr || dateStr.toLowerCase() === 'present') return defaultEnd ? null : new Date();
        return new Date(dateStr);
    }

    mapExperiences(rawExp: FreshLinkedInExperience[]): (Experience & { skillNames: string[] })[] {
        return rawExp.map(exp => ({
            id: '',
            role: exp.title,
            company: exp.company.name,
            startDate: this.parseDateStr(exp.date?.start) || new Date(),
            endDate: this.parseDateStr(exp.date?.end, true),
            description: exp.description || null,
            isImportedFromLinkedIn: true,
            skillNames: exp.skills ?? [],
        }));
    }

    mapEducations(rawEdu: FreshLinkedInEducation[]): (Education & { skillNames: string[] })[] {
        return rawEdu.map(edu => ({
            id: '',
            institution: edu.school,
            degree: edu.degree || 'Grado no especificado',
            startDate: this.parseDateStr(edu.date?.start) || new Date(),
            endDate: this.parseDateStr(edu.date?.end, true),
            isImportedFromLinkedIn: true,
            skillNames: edu.skills ?? [],
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
