import { Experience, Education, Certificate } from '../entities';

export interface ILinkedInSyncRepository {
    upsertExperiences(experiences: Experience[]): Promise<void>;
    upsertEducation(educations: Education[]): Promise<void>;
    upsertCertificates(certificates: Certificate[]): Promise<void>;
}
