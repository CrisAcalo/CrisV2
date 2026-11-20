import { ILinkedInSyncRepository } from '../../domain/repositories/ILinkedInSyncRepository';
import { ILinkedInService } from '../../infrastructure/services/ILinkedInService';
import { ISystemConfigurationRepository } from '../../domain/repositories/ISystemConfigurationRepository';
import { BadRequestError } from '../../domain/errors/AppError';

export class SyncLinkedInDataUseCase {
    constructor(
        private linkedInService: ILinkedInService,
        private linkedInSyncRepository: ILinkedInSyncRepository,
        private configRepository: ISystemConfigurationRepository
    ) { }

    private async getUrn(): Promise<string> {
        const config = await this.configRepository.getConfig();
        if (!config.linkedInUrn) {
            throw new BadRequestError('Configura el URN de LinkedIn antes de sincronizar.');
        }
        return config.linkedInUrn;
    }

    async executeExperiences(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        console.log('[SyncLinkedIn] Starting experiences sync');
        
        const rawData = await this.linkedInService.fetchExperiences(urn);
        const domainData = this.linkedInService.mapExperiences(rawData);
        
        if (domainData.length > 0) {
            await this.linkedInSyncRepository.upsertExperiences(domainData);
        }
        
        const message = domainData.length > 0 
            ? `Se sincronizaron ${domainData.length} experiencias.`
            : 'LinkedIn no devolvió experiencias. Se conservaron los registros actuales.';
            
        return { message, count: domainData.length };
    }

    async executeEducations(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        console.log('[SyncLinkedIn] Starting education sync');
        
        const rawData = await this.linkedInService.fetchEducations(urn);
        const domainData = this.linkedInService.mapEducations(rawData);
        
        if (domainData.length > 0) {
            await this.linkedInSyncRepository.upsertEducation(domainData);
        }

        const message = domainData.length > 0 
            ? `Se sincronizaron ${domainData.length} estudios.`
            : 'LinkedIn no devolvió estudios. Se conservaron los registros actuales.';

        return { message, count: domainData.length };
    }

    async executeCertificates(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        console.log('[SyncLinkedIn] Starting certificates sync');
        
        const rawData = await this.linkedInService.fetchCertificates(urn);
        const domainData = this.linkedInService.mapCertificates(rawData);
        
        if (domainData.length > 0) {
            await this.linkedInSyncRepository.upsertCertificates(domainData);
        }

        const message = domainData.length > 0 
            ? `Se sincronizaron ${domainData.length} certificaciones.`
            : 'LinkedIn no devolvió certificaciones. Se conservaron los registros actuales.';

        return { message, count: domainData.length };
    }
}
