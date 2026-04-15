import { Project, Experience, Education, Skill, Certificate } from '../../domain/entities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ListResponse<T> {
  status: string;
  data: T[];
}

export async function getPublicProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json: ListResponse<Project> = await res.json();
  // Filter for published ones only (sometimes backend does this automatically but it's good practice)
  return json.data.filter(p => p.isPublished);
}

export async function getPublicExperiences(): Promise<Experience[]> {
  const res = await fetch(`${API_URL}/experiences`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json: ListResponse<Experience> = await res.json();
  return json.data;
}

export async function getPublicEducations(): Promise<Education[]> {
  const res = await fetch(`${API_URL}/educations`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json: ListResponse<Education> = await res.json();
  return json.data;
}

export async function getPublicSkills(): Promise<Skill[]> {
  const res = await fetch(`${API_URL}/skills`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json: ListResponse<Skill> = await res.json();
  return json.data.filter(s => s.isPublic);
}

export async function getPublicCertificates(): Promise<Certificate[]> {
  const res = await fetch(`${API_URL}/certificates`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json: ListResponse<Certificate> = await res.json();
  return json.data;
}
