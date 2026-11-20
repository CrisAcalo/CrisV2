import axios from 'axios';
import { ILinkedInService, FreshLinkedInExperience, FreshLinkedInEducation, FreshLinkedInCertificate } from './ILinkedInService';
import { Experience, Education, Certificate } from '../../domain/entities';
import { BadRequestError } from '../../domain/errors/AppError';
import { env } from '../../config/env';

export class LinkedInService implements ILinkedInService {
    private readonly API_HOST = 'fresh-linkedin-scraper-api.p.rapidapi.com';
    private readonly BASE_URL = `https://${this.API_HOST}/api/v1/user`;
    private readonly MAX_PAGES = 10;
    private readonly SYNC_TIMEOUT_MS = 45_000;

    private getHeaders() {
        const token = env.LINKEDIN_API_TOKEN;
        if (!token) throw new Error('LINKEDIN_API_TOKEN is missing in environment variables');
        
        return {
            'x-rapidapi-key': token,
            'x-rapidapi-host': this.API_HOST
        };
    }

    private async fetchAll<T>(endpoint: string, label: string, urn: string): Promise<T[]> {
        const records: T[] = [];
        const signal = AbortSignal.timeout(this.SYNC_TIMEOUT_MS);
        for (let page = 1; page <= this.MAX_PAGES; page++) {
            let response;
            try {
                response = await axios.get(`${this.BASE_URL}/${endpoint}`, {
                    headers: this.getHeaders(),
                    timeout: 15000,
                    signal,
                    maxRedirects: 0,
                    maxContentLength: 1024 * 1024,
                    params: { urn, page },
                });
            } catch (error) {
                const status = axios.isAxiosError(error) ? error.response?.status : undefined;
                console.error(`[LinkedInService] ${label} request failed`, { status, page });
                if (status === 429) throw new BadRequestError('Se alcanzó el límite de solicitudes de LinkedIn.');
                if (status === 401 || status === 403) throw new BadRequestError('La clave de LinkedIn no tiene acceso a este recurso.');
                throw new BadRequestError(`No se pudieron obtener ${label} de LinkedIn.`);
            }

            const body = response.data;
            if (response.status !== 200 || body?.success !== true || !Array.isArray(body.data)) {
                console.error(`[LinkedInService] ${label} returned an incomplete response`, { status: response.status, page });
                throw new BadRequestError(`LinkedIn no entregó todos los datos de ${label}. Inténtalo más tarde.`);
            }
            records.push(...body.data as T[]);
            if (body.has_more !== true) return records;
            if (body.data.length === 0) break;
        }
        throw new BadRequestError(`LinkedIn tiene más de ${this.MAX_PAGES} páginas de ${label}; se detuvo la sincronización para conservar los datos actuales.`);
    }

    fetchExperiences(urn: string): Promise<FreshLinkedInExperience[]> {
        return this.fetchAll('experience', 'experiencias', urn);
    }

    fetchEducations(urn: string): Promise<FreshLinkedInEducation[]> {
        return this.fetchAll('educations', 'estudios', urn);
    }

    fetchCertificates(urn: string): Promise<FreshLinkedInCertificate[]> {
        return this.fetchAll('certifications', 'certificaciones', urn);
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
