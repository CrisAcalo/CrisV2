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
            throw new BadRequestError('LinkedIn URN is not configured in settings. Please update your system settings first.');
        }
        return config.linkedInUrn;
    }

    async executeExperiences(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        console.log(`[SyncLinkedIn] Starting Experiences sync for URN: ${urn}`);
        
        const rawData = await this.linkedInService.fetchExperiences(urn);
        const domainData = this.linkedInService.mapExperiences(rawData);
        
        console.log(`[SyncLinkedIn] Persisting ${domainData.length} experiences to database...`);
        await this.linkedInSyncRepository.upsertExperiences(domainData);
        
        const message = domainData.length > 0 
            ? `Successfully synchronized ${domainData.length} experiences.`
            : 'Synchronization finished, but no experiences were found for this profile.';
            
        return { message, count: domainData.length };
    }

    async executeEducations(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        console.log(`[SyncLinkedIn] Starting Educations sync for URN: ${urn}`);
        
        const rawData = await this.linkedInService.fetchEducations(urn);
        const domainData = this.linkedInService.mapEducations(rawData);
        
        console.log(`[SyncLinkedIn] Persisting ${domainData.length} education records to database...`);
        await this.linkedInSyncRepository.upsertEducation(domainData);

        const message = domainData.length > 0 
            ? `Successfully synchronized ${domainData.length} education records.`
            : 'Synchronization finished, but no education data was found.';

        return { message, count: domainData.length };
    }

    async executeCertificates(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        console.log(`[SyncLinkedIn] Starting Certificates sync for URN: ${urn}`);
        
        const rawData = await this.linkedInService.fetchCertificates(urn);
        const domainData = this.linkedInService.mapCertificates(rawData);
        
        console.log(`[SyncLinkedIn] Persisting ${domainData.length} certificates to database...`);
        await this.linkedInSyncRepository.upsertCertificates(domainData);

        const message = domainData.length > 0 
            ? `Successfully synchronized ${domainData.length} certificates.`
            : 'Synchronization finished, but no certificates were found.';

        return { message, count: domainData.length };
    }
}
