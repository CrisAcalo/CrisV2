import { prisma } from './client';
import { ISystemConfigurationRepository } from '../../../domain/repositories/ISystemConfigurationRepository';
import { SystemConfiguration } from '../../../domain/entities/SystemConfiguration';

export class PrismaSystemConfigurationRepository implements ISystemConfigurationRepository {
    async getConfig(): Promise<SystemConfiguration> {
        let config = await prisma.systemConfiguration.findUnique({
            where: { id: 'default' }
        });

        // Seed if missing
        if (!config) {
            config = await prisma.systemConfiguration.create({
                data: {
                    id: 'default',
                    theme: 'system'
                }
            });
        }

        return config;
    }

    async updateConfig(data: Partial<SystemConfiguration>): Promise<SystemConfiguration> {
        return await prisma.systemConfiguration.upsert({
            where: { id: 'default' },
            create: {
                id: 'default',
                linkedInUrn: data.linkedInUrn,
                theme: data.theme || 'system'
            },
            update: {
                linkedInUrn: data.linkedInUrn,
                theme: data.theme
            }
        });
    }
}
