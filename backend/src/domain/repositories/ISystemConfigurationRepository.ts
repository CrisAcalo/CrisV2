import { SystemConfiguration } from '../entities/SystemConfiguration';

export interface ISystemConfigurationRepository {
    getConfig(): Promise<SystemConfiguration>;
    updateConfig(config: Partial<SystemConfiguration>): Promise<SystemConfiguration>;
}
