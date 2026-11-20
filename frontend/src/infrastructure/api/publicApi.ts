import type { Project, Experience, Education, Skill, Certificate } from '../../domain/entities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ListResponse<T> {
  status: string;
  data: T[];
}

async function getPublicList<T>(resource: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}/${resource}`, { next: { revalidate: 300, tags: ['portfolio-public'] } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ListResponse<T> = await res.json();
    if (!Array.isArray(json.data)) throw new Error('Invalid API response');
    return json.data;
  } catch (error) {
    console.error(`Failed to load public ${resource}:`, error);
    throw error;
  }
}

export async function getPublicProjects(): Promise<Project[]> {
  return getPublicList<Project>('projects');
}

export async function getPublicProject(id: string): Promise<Project | null> {
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) return null;

  const normalizedId = id.toLowerCase();
  const response = await fetch(`${API_URL}/projects/${encodeURIComponent(normalizedId)}`, { next: { revalidate: 300, tags: ['portfolio-public'] } });
  if (response.status === 400 || response.status === 404) return null;
  if (!response.ok) throw new Error(`Project API returned HTTP ${response.status}`);

  const { data: project }: { data?: Project } = await response.json();
  if (!project || project.id !== normalizedId || typeof project.title !== 'string') {
    throw new Error('Invalid project response');
  }

  return project.isPublished && !project.deletedAt ? project : null;
}

export async function getPublicExperiences(): Promise<Experience[]> {
  return getPublicList<Experience>('experiences');
}

export async function getPublicEducations(): Promise<Education[]> {
  return getPublicList<Education>('educations');
}

export async function getPublicSkills(): Promise<Skill[]> {
  return getPublicList<Skill>('skills');
}

export async function getPublicCertificates(): Promise<Certificate[]> {
  return getPublicList<Certificate>('certificates');
}
