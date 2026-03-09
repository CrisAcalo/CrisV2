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
        const rawData = await this.linkedInService.fetchExperiences(urn);
        const domainData = this.linkedInService.mapExperiences(rawData);
        await this.linkedInSyncRepository.upsertExperiences(domainData);
        return { message: 'Experiences synchronized successfully', count: domainData.length };
    }

    async executeEducations(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        const rawData = await this.linkedInService.fetchEducations(urn);
        const domainData = this.linkedInService.mapEducations(rawData);
        await this.linkedInSyncRepository.upsertEducation(domainData);
        return { message: 'Educations synchronized successfully', count: domainData.length };
    }

    async executeCertificates(): Promise<{ message: string; count: number }> {
        const urn = await this.getUrn();
        const rawData = await this.linkedInService.fetchCertificates(urn);
        const domainData = this.linkedInService.mapCertificates(rawData);
        await this.linkedInSyncRepository.upsertCertificates(domainData);
        return { message: 'Certificates synchronized successfully', count: domainData.length };
    }
}
