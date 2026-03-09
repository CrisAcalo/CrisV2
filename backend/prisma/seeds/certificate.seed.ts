import { PrismaClient } from '@prisma/client';

export const seedCertificates = async (prisma: PrismaClient) => {
    const certificates = [
        {
            name: 'AWS Certified Solutions Architect – Associate',
            issuingOrganization: 'Amazon Web Services',
            issueDate: new Date('2023-05-10'),
            credentialUrl: 'https://awscertificates.amazon.com/verify/aws-123',
        },
        {
            name: 'Google Cloud Professional Cloud Architect',
            issuingOrganization: 'Google Cloud',
            issueDate: new Date('2022-11-22'),
            credentialUrl: 'https://credentials.google.com/verify/gcp-456',
        },
        {
            name: 'Meta Web Developer Certificate',
            issuingOrganization: 'Meta via Coursera',
            issueDate: new Date('2021-08-15'),
            credentialUrl: 'https://coursera.org/verify/meta-789',
        }
    ];

    for (const cert of certificates) {
        await prisma.certificate.create({
            data: cert,
        });
    }

    console.log(`✅ ${certificates.length} Certificados creados`);
};
