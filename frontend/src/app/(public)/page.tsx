import { HeroSection, TimelineSection, ProjectsSection, SkillsSection, ContactSection, CertificatesSection } from '../../presentation/components/public';
import { getPublicProjects, getPublicExperiences, getPublicEducations, getPublicSkills, getPublicCertificates } from '../../infrastructure/api/publicApi';
import { PublicNavbar } from '../../presentation/components/common/PublicNavbar';

// Keep the last successfully generated portfolio available while Render wakes up.
export const revalidate = 300;

export default async function Home() {
  const [projects, experiences, educations, skills, certificates] = await Promise.all([
    getPublicProjects(),
    getPublicExperiences(),
    getPublicEducations(),
    getPublicSkills(),
    getPublicCertificates()
  ]);

  const publishedProjects = projects.filter((project) => project.isPublished && !project.deletedAt);
  const hasProjects = publishedProjects.length > 0;
  const hasTimeline = experiences.length > 0 || educations.length > 0;
  const publicSkills = skills.filter((skill) => skill.isPublic);
  const sections = [
    ...(hasProjects ? [{ id: 'proyectos', label: 'Proyectos' }] : []),
    ...(hasTimeline ? [{ id: 'experiencia', label: 'Trayectoria' }] : []),
    ...(publicSkills.length ? [{ id: 'skills', label: 'Tecnologías' }] : []),
    ...(certificates.length ? [{ id: 'certificados', label: 'Certificados' }] : []),
    { id: 'contacto', label: 'Contacto' },
  ];

  return (
    <>
      <PublicNavbar sections={sections} />
      <main id="portfolio-content" className="portfolio-main" tabIndex={-1}>
        <HeroSection hasProjects={hasProjects} />
        {hasProjects && <ProjectsSection projects={publishedProjects} />}
        {hasTimeline && <TimelineSection experiences={experiences} educations={educations} />}
        {publicSkills.length > 0 && <SkillsSection skills={publicSkills} projects={publishedProjects} />}
        {certificates.length > 0 && <CertificatesSection certificates={certificates} />}
        <ContactSection />
      </main>
    </>
  );
}
