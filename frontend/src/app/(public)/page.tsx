import { HeroSection, TimelineSection, ProjectsSection, SkillsSection, ContactSection, CertificatesSection } from '../../presentation/components/public';
import { getPublicProjects, getPublicExperiences, getPublicEducations, getPublicSkills, getPublicCertificates } from '../../infrastructure/api/publicApi';
import { SectionsInitializer } from '../../presentation/components/common/SectionsInitializer';

export default async function Home() {
  const [projects, experiences, educations, skills, certificates] = await Promise.all([
    getPublicProjects(),
    getPublicExperiences(),
    getPublicEducations(),
    getPublicSkills(),
    getPublicCertificates()
  ]);

  const hasProjects = projects.length > 0;

  return (
    <main className="flex min-h-screen flex-col w-full">
      {/* Syncs server data into client store (for navbar conditional links) */}
      <SectionsInitializer hasProjects={hasProjects} />

      <HeroSection />
      <TimelineSection experiences={experiences} educations={educations} />
      {hasProjects && <ProjectsSection projects={projects} />}
      <SkillsSection skills={skills} />
      <CertificatesSection certificates={certificates} />
      <ContactSection />
    </main>
  );
}
