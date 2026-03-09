import { ISystemConfigurationRepository } from '../../domain/repositories/ISystemConfigurationRepository';
import { SystemConfiguration } from '../../domain/entities/SystemConfiguration';

export class SystemConfigurationUseCases {
    constructor(private readonly configRepository: ISystemConfigurationRepository) { }

    async getSystemConfig(): Promise<SystemConfiguration> {
        return await this.configRepository.getConfig();
    }

    async updateSystemConfig(data: Partial<SystemConfiguration>): Promise<SystemConfiguration> {
        return await this.configRepository.updateConfig(data);
    }
}
